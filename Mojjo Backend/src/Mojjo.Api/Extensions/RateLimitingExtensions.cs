using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;

namespace Mojjo.Api.Extensions;

public static class RateLimitingExtensions
{
    public static IServiceCollection AddCustomRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = async (context, cancellationToken) =>
            {
                var httpContext = context.HttpContext;
                httpContext.Response.ContentType = "application/json";
                httpContext.Response.Headers.Append("Retry-After", "60");

                var traceId = httpContext.TraceIdentifier;
                var response = new ApiResponse<object>
                {
                    Success = false,
                    Message = "Too many requests. Please try again after 60 seconds.",
                    ErrorCode = "RATE_LIMIT_EXCEEDED",
                    TraceId = traceId,
                    Errors = new List<string> { "Rate limit threshold exceeded for this operation. Please wait before retrying." },
                    Data = null
                };

                await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
            };

            // 1. Strict Policy for Authentication (Login, Register, Password Reset) -> 5 req/min
            options.AddPolicy("auth-strict", httpContext =>
            {
                var partitionKey = ResolveClientPartitionKey(httpContext);
                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                });
            });

            // 2. Strict OTP Policy (Send OTP, Verify OTP) -> 10 req/min
            options.AddPolicy("otp-policy", httpContext =>
            {
                var partitionKey = ResolveClientPartitionKey(httpContext);
                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                });
            });

            // 3. Payment & Order Placement Policy -> 10 req/min
            options.AddPolicy("payment-policy", httpContext =>
            {
                var partitionKey = ResolveClientPartitionKey(httpContext);
                return RateLimitPartition.GetSlidingWindowLimiter(partitionKey, _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow = 2,
                    QueueLimit = 0
                });
            });

            // 4. Search & Autocomplete Policy -> 30 req/min
            options.AddPolicy("search-policy", httpContext =>
            {
                var partitionKey = ResolveClientPartitionKey(httpContext);
                return RateLimitPartition.GetSlidingWindowLimiter(partitionKey, _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 30,
                    Window = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow = 3,
                    QueueLimit = 2
                });
            });

            // 5. General Catalog & Browsing Policy -> 60 req/min
            options.AddPolicy("general-api", httpContext =>
            {
                var partitionKey = ResolveClientPartitionKey(httpContext);
                return RateLimitPartition.GetSlidingWindowLimiter(partitionKey, _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 60,
                    Window = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow = 4,
                    QueueLimit = 2
                });
            });
        });

        return services;
    }

    private static string ResolveClientPartitionKey(HttpContext context)
    {
        // Use authenticated user ID if logged in, otherwise fall back to client IP address
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? context.User?.FindFirst("sub")?.Value;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            return $"usr:{userId}";
        }

        var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault() 
                 ?? context.Connection.RemoteIpAddress?.ToString() 
                 ?? "unknown-client";

        return $"ip:{ip}";
    }
}
