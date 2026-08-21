using System.Security.Claims;
using Serilog.Context;

namespace Mojjo.Api.Middleware;

public class RequestLogEnrichmentMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLogEnrichmentMiddleware(RequestDelegate _next)
    {
        this._next = _next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? context.User?.FindFirst("sub")?.Value 
                     ?? "anonymous";

        var clientIp = context.Request.Headers["X-Forwarded-For"].FirstOrDefault() 
                       ?? context.Connection.RemoteIpAddress?.ToString() 
                       ?? "unknown";

        var traceId = context.TraceIdentifier;

        using (LogContext.PushProperty("UserId", userId))
        using (LogContext.PushProperty("ClientIp", clientIp))
        using (LogContext.PushProperty("TraceId", traceId))
        using (LogContext.PushProperty("RequestMethod", context.Request.Method))
        using (LogContext.PushProperty("RequestPath", context.Request.Path.Value))
        {
            await _next(context);
        }
    }
}
