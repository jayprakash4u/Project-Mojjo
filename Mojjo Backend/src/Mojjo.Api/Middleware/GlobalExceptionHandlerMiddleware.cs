using System.Net;
using System.Security.Claims;
using System.Text.Json;
using FluentValidation;
using Mojjo.Application.Common;
using Mojjo.Application.Common.Exceptions;

namespace Mojjo.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";

        _logger.LogError(
            exception,
            "Unhandled exception [{TraceId}] during {RequestMethod} {RequestPath} for User {UserId}: {ErrorMessage}",
            traceId,
            context.Request.Method,
            context.Request.Path,
            userId,
            exception.Message);

        context.Response.ContentType = "application/json";

        var (statusCode, message, errorCode, errors) = exception switch
        {
            AppException appEx => (
                (int)appEx.StatusCode,
                appEx.Message,
                appEx.ErrorCode,
                appEx.Errors
            ),
            ValidationException validationEx => (
                (int)HttpStatusCode.BadRequest,
                "One or more validation errors occurred.",
                "VALIDATION_ERROR",
                validationEx.Errors.Select(e => e.ErrorMessage).ToList()
            ),
            UnauthorizedAccessException => (
                (int)HttpStatusCode.Unauthorized,
                "Authentication credentials were missing or invalid.",
                "UNAUTHORIZED",
                new List<string> { "You must be authenticated to perform this action." }
            ),
            _ => (
                (int)HttpStatusCode.InternalServerError,
                _env.IsDevelopment() ? exception.Message : "An unexpected server error occurred.",
                "INTERNAL_SERVER_ERROR",
                _env.IsDevelopment() && exception.StackTrace != null 
                    ? new List<string> { exception.StackTrace } 
                    : new List<string> { $"Reference Trace ID: {traceId}" }
            )
        };

        context.Response.StatusCode = statusCode;

        var response = new ApiResponse<object>
        {
            Success = false,
            Message = message,
            ErrorCode = errorCode,
            TraceId = traceId,
            Errors = errors,
            Data = null
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });

        await context.Response.WriteAsync(json);
    }
}
