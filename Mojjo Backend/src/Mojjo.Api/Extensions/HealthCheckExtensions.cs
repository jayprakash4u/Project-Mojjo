using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Infrastructure.Persistence;

namespace Mojjo.Api.Extensions;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddCustomHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks()
            // 1. Liveness check (Self-check)
            .AddCheck("self", () => HealthCheckResult.Healthy("API host is running."), tags: new[] { "live" })
            // 2. Database readiness check
            .AddDbContextCheck<MojjoDbContext>(
                name: "database",
                failureStatus: HealthStatus.Unhealthy,
                tags: new[] { "ready", "sql" })
            // 3. Cache subsystem check
            .AddCheck<CacheHealthCheck>(
                name: "cache",
                failureStatus: HealthStatus.Degraded,
                tags: new[] { "ready", "cache" });

        return services;
    }

    public static WebApplication MapCustomHealthChecks(this WebApplication app)
    {
        // 1. General health endpoint (All checks)
        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = WriteHealthResponseAsync,
            AllowCachingResponses = false
        });

        // 2. Liveness probe (Kubernetes / ECS)
        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("live"),
            ResponseWriter = WriteHealthResponseAsync,
            AllowCachingResponses = false
        });

        // 3. Readiness probe (Kubernetes / Load Balancer)
        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = WriteHealthResponseAsync,
            AllowCachingResponses = false
        });

        return app;
    }

    private static async Task WriteHealthResponseAsync(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json; charset=utf-8";

        var response = new
        {
            status = report.Status.ToString(),
            totalDurationMs = report.TotalDuration.TotalMilliseconds,
            timestamp = DateTime.UtcNow,
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                durationMs = e.Value.Duration.TotalMilliseconds,
                description = e.Value.Description ?? (e.Value.Status == HealthStatus.Healthy ? "Healthy" : "Degraded"),
                error = e.Value.Exception?.Message,
                tags = e.Value.Tags
            })
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}

public class CacheHealthCheck : IHealthCheck
{
    private readonly ICacheService _cacheService;

    public CacheHealthCheck(ICacheService cacheService)
    {
        _cacheService = cacheService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            const string testKey = "healthcheck:probe";
            await _cacheService.SetAsync(testKey, "OK", TimeSpan.FromSeconds(30), cancellationToken);
            var value = await _cacheService.GetAsync<string>(testKey, cancellationToken);

            if (value == "OK")
            {
                return HealthCheckResult.Healthy("Cache subsystem responsive.");
            }

            return HealthCheckResult.Degraded("Cache probe write succeeded but read returned null.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Degraded($"Cache health check failed (operating in fallback mode): {ex.Message}");
        }
    }
}
