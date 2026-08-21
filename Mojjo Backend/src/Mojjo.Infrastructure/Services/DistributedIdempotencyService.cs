using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.Infrastructure;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Entities;
using Mojjo.Domain.Enums;
using Mojjo.Infrastructure.Persistence;

namespace Mojjo.Infrastructure.Services;

public class DistributedIdempotencyService : IIdempotencyService
{
    private readonly MojjoDbContext _dbContext;
    private readonly ICacheService _cacheService;
    private readonly ILogger<DistributedIdempotencyService> _logger;

    public DistributedIdempotencyService(
        MojjoDbContext dbContext,
        ICacheService cacheService,
        ILogger<DistributedIdempotencyService> logger)
    {
        _dbContext = dbContext;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<IdempotencyAcquireResult> TryAcquireAsync(
        string key,
        string userId,
        string requestPath,
        string requestPayload,
        CancellationToken cancellationToken = default)
    {
        var payloadHash = ComputeHash(requestPayload);
        var cacheKey = $"idemp:{userId}:{key}";

        // 1. Check L1/L2 Cache First (< 1ms)
        var cachedRecord = await _cacheService.GetAsync<IdempotencyRecord>(cacheKey, cancellationToken);
        if (cachedRecord != null)
        {
            return EvaluateExistingRecord(cachedRecord, payloadHash);
        }

        // 2. Query SQL Database
        var dbRecord = await _dbContext.IdempotencyRecords
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Key == key, cancellationToken);

        if (dbRecord != null)
        {
            await _cacheService.SetAsync(cacheKey, dbRecord, TimeSpan.FromHours(24), cancellationToken);
            return EvaluateExistingRecord(dbRecord, payloadHash);
        }

        // 3. First Request -> Acquire Lock and Register "Processing" State
        var newRecord = new IdempotencyRecord
        {
            Id = Guid.NewGuid().ToString("N"),
            Key = key,
            UserId = userId,
            RequestPath = requestPath,
            RequestHash = payloadHash,
            Status = IdempotencyStatus.Processing,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        try
        {
            _dbContext.IdempotencyRecords.Add(newRecord);
            await _dbContext.SaveChangesAsync(cancellationToken);
            await _cacheService.SetAsync(cacheKey, newRecord, TimeSpan.FromHours(24), cancellationToken);

            _logger.LogInformation("Idempotency lock acquired for Key: {Key}, User: {UserId}, Path: {Path}", key, userId, requestPath);
            return IdempotencyAcquireResult.Acquired();
        }
        catch (DbUpdateException)
        {
            // Concurrent race won by another parallel request
            var concurrentRecord = await _dbContext.IdempotencyRecords
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId && x.Key == key, cancellationToken);

            if (concurrentRecord != null)
            {
                return EvaluateExistingRecord(concurrentRecord, payloadHash);
            }

            return IdempotencyAcquireResult.Processing();
        }
    }

    public async Task SaveResponseAsync(
        string key,
        string userId,
        int statusCode,
        string responseBody,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"idemp:{userId}:{key}";

        var record = await _dbContext.IdempotencyRecords
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Key == key, cancellationToken);

        if (record != null)
        {
            record.Status = IdempotencyStatus.Completed;
            record.ResponseStatusCode = statusCode;
            record.ResponseBody = responseBody;

            await _dbContext.SaveChangesAsync(cancellationToken);
            await _cacheService.SetAsync(cacheKey, record, TimeSpan.FromHours(24), cancellationToken);

            _logger.LogInformation("Idempotency response saved for Key: {Key}, Status: {StatusCode}", key, statusCode);
        }
    }

    public async Task MarkFailedAsync(string key, string userId, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"idemp:{userId}:{key}";

        var record = await _dbContext.IdempotencyRecords
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Key == key, cancellationToken);

        if (record != null)
        {
            record.Status = IdempotencyStatus.Failed;
            await _dbContext.SaveChangesAsync(cancellationToken);
            await _cacheService.RemoveAsync(cacheKey, cancellationToken);
        }
    }

    private IdempotencyAcquireResult EvaluateExistingRecord(IdempotencyRecord record, string incomingHash)
    {
        // 1. Detect Payload Mismatch (Same Key with Different Payload)
        if (!string.Equals(record.RequestHash, incomingHash, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Idempotency payload mismatch for Key: {Key}, User: {UserId}", record.Key, record.UserId);
            return IdempotencyAcquireResult.Mismatch();
        }

        // 2. If Completed -> Replay Cached Response
        if (record.Status == IdempotencyStatus.Completed && record.ResponseStatusCode.HasValue)
        {
            _logger.LogInformation("Replaying cached idempotent response for Key: {Key}, Code: {Code}", record.Key, record.ResponseStatusCode);
            return IdempotencyAcquireResult.Completed(record.ResponseStatusCode.Value, record.ResponseBody ?? string.Empty);
        }

        // 3. If Still Processing within lock window (< 2 min)
        if (record.Status == IdempotencyStatus.Processing && record.CreatedAt > DateTime.UtcNow.AddMinutes(-2))
        {
            _logger.LogWarning("Concurrent idempotent request currently in-flight for Key: {Key}", record.Key);
            return IdempotencyAcquireResult.Processing();
        }

        // Lock expired or failed -> Allow re-acquisition
        return IdempotencyAcquireResult.Acquired();
    }

    private static string ComputeHash(string input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
