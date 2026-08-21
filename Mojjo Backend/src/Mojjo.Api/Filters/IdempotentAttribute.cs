using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Mojjo.Application.Common;
using Mojjo.Application.Interfaces.Infrastructure;

namespace Mojjo.Api.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class IdempotentAttribute : Attribute, IAsyncActionFilter
{
    private readonly bool _isRequired;

    public IdempotentAttribute(bool isRequired = false)
    {
        _isRequired = isRequired;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var httpContext = context.HttpContext;
        var idempotencyKey = httpContext.Request.Headers["Idempotency-Key"].FirstOrDefault()
                             ?? httpContext.Request.Headers["X-Idempotency-Key"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(idempotencyKey))
        {
            if (_isRequired)
            {
                context.Result = new BadRequestObjectResult(
                    ApiResponse<object>.Fail("Idempotency-Key header is required for this operation.", "MISSING_IDEMPOTENCY_KEY"));
                return;
            }

            // Optional idempotency -> Proceed normally
            await next();
            return;
        }

        var idempotencyService = httpContext.RequestServices.GetRequiredService<IIdempotencyService>();
        var userId = httpContext.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? httpContext.User?.FindFirst("sub")?.Value 
                     ?? "anonymous";

        var requestPath = httpContext.Request.Path.Value ?? "/";
        var payloadJson = JsonSerializer.Serialize(context.ActionArguments);

        var acquireResult = await idempotencyService.TryAcquireAsync(
            idempotencyKey,
            userId,
            requestPath,
            payloadJson,
            httpContext.RequestAborted);

        // 1. Detect Payload Mismatch
        if (acquireResult.IsMismatch)
        {
            context.Result = new ObjectResult(
                ApiResponse<object>.Fail("The request payload does not match the original request for this Idempotency-Key.", "IDEMPOTENCY_PAYLOAD_MISMATCH"))
            {
                StatusCode = StatusCodes.Status422UnprocessableEntity
            };
            return;
        }

        // 2. Detect Concurrent In-Flight Execution
        if (acquireResult.IsProcessing)
        {
            context.Result = new ObjectResult(
                ApiResponse<object>.Fail("A request with this Idempotency-Key is currently being processed. Please wait.", "IDEMPOTENCY_IN_PROGRESS"))
            {
                StatusCode = StatusCodes.Status409Conflict
            };
            return;
        }

        // 3. Replay Completed Cached Response
        if (acquireResult.IsCompleted && !string.IsNullOrEmpty(acquireResult.ResponseBody))
        {
            httpContext.Response.Headers.Append("X-Cache-Lookup", "IDEMPOTENCY-HIT");
            context.Result = new ContentResult
            {
                Content = acquireResult.ResponseBody,
                ContentType = "application/json; charset=utf-8",
                StatusCode = acquireResult.StatusCode ?? StatusCodes.Status200OK
            };
            return;
        }

        // 4. First Request -> Execute Action and Save Response
        var executedContext = await next();

        if (executedContext.Exception == null)
        {
            var statusCode = StatusCodes.Status200OK;
            string responseJson = string.Empty;

            if (executedContext.Result is ObjectResult objectResult)
            {
                statusCode = objectResult.StatusCode ?? StatusCodes.Status200OK;
                responseJson = JsonSerializer.Serialize(objectResult.Value, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
                });
            }
            else if (executedContext.Result is ContentResult contentResult)
            {
                statusCode = contentResult.StatusCode ?? StatusCodes.Status200OK;
                responseJson = contentResult.Content ?? string.Empty;
            }

            if (statusCode < 400 && !string.IsNullOrEmpty(responseJson))
            {
                await idempotencyService.SaveResponseAsync(
                    idempotencyKey,
                    userId,
                    statusCode,
                    responseJson,
                    httpContext.RequestAborted);
            }
            else
            {
                await idempotencyService.MarkFailedAsync(idempotencyKey, userId, httpContext.RequestAborted);
            }
        }
        else
        {
            await idempotencyService.MarkFailedAsync(idempotencyKey, userId, httpContext.RequestAborted);
        }
    }
}
