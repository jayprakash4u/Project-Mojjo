using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Infrastructure.Caching;

public class DistributedCacheService : ICacheService
{
    private readonly IDistributedCache _distributedCache;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<DistributedCacheService> _logger;

    private static bool _redisAvailable = true;
    private static DateTime _nextRedisRetryTime = DateTime.MinValue;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    public DistributedCacheService(
        IDistributedCache distributedCache,
        IMemoryCache memoryCache,
        ILogger<DistributedCacheService> logger)
    {
        _distributedCache = distributedCache;
        _memoryCache = memoryCache;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        // 1. Fast L1 In-Memory Cache Check (< 1ms)
        if (_memoryCache.TryGetValue(key, out T? localValue) && localValue != null)
        {
            return localValue;
        }

        // 2. Check L2 Distributed Cache (Redis) if available
        if (_redisAvailable || DateTime.UtcNow > _nextRedisRetryTime)
        {
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromMilliseconds(500)); // 500ms fast timeout

                var cachedData = await _distributedCache.GetStringAsync(key, cts.Token);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    var result = JsonSerializer.Deserialize<T>(cachedData, JsonOptions);
                    if (result != null)
                    {
                        // Backfill L1 Memory Cache
                        _memoryCache.Set(key, result, TimeSpan.FromMinutes(10));
                        _redisAvailable = true;
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                _redisAvailable = false;
                _nextRedisRetryTime = DateTime.UtcNow.AddMinutes(2); // Cool-down circuit breaker
                _logger.LogWarning(ex, "Redis cache unavailable. Operating in Fast In-Memory mode for key: {CacheKey}", key);
            }
        }

        return default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        if (value == null) return;

        var ttl = expiration ?? TimeSpan.FromMinutes(30);

        // 1. Populate L1 In-Memory Cache
        _memoryCache.Set(key, value, ttl);

        // 2. Populate L2 Distributed Cache (Redis)
        if (_redisAvailable || DateTime.UtcNow > _nextRedisRetryTime)
        {
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromMilliseconds(500));

                var serialized = JsonSerializer.Serialize(value, JsonOptions);
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = ttl
                };

                await _distributedCache.SetStringAsync(key, serialized, options, cts.Token);
                _redisAvailable = true;
            }
            catch (Exception ex)
            {
                _redisAvailable = false;
                _nextRedisRetryTime = DateTime.UtcNow.AddMinutes(2);
                _logger.LogWarning(ex, "Redis write failed. Preserved in L1 Memory Cache for key: {CacheKey}", key);
            }
        }
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        // Check L1 & L2 Cache
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached != null)
        {
            return cached;
        }

        // Fetch from Database Source on Cache Miss
        var result = await factory();

        if (result != null)
        {
            await SetAsync(key, result, expiration, cancellationToken);
        }

        return result;
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        _memoryCache.Remove(key);

        if (_redisAvailable)
        {
            try
            {
                await _distributedCache.RemoveAsync(key, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis remove failed for key: {CacheKey}", key);
            }
        }
    }

    public async Task RemoveByPrefixAsync(string prefixKey, CancellationToken cancellationToken = default)
    {
        await RemoveAsync(prefixKey, cancellationToken);
    }
}
