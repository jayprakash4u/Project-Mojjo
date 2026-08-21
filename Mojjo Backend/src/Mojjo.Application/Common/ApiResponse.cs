namespace Mojjo.Application.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ErrorCode { get; set; }
    public string? TraceId { get; set; }
    public List<string>? Errors { get; set; }
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null)
        => new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message, string? errorCode = null, List<string>? errors = null, string? traceId = null)
        => new() 
        { 
            Success = false, 
            Message = message, 
            ErrorCode = errorCode ?? "BAD_REQUEST",
            Errors = errors ?? new List<string> { message }, 
            TraceId = traceId 
        };

    public static ApiResponse<T> Fail(List<string> errors, string? errorCode = null, string? traceId = null)
        => new() 
        { 
            Success = false, 
            Message = errors.FirstOrDefault() ?? "One or more errors occurred.", 
            ErrorCode = errorCode ?? "VALIDATION_ERROR", 
            Errors = errors, 
            TraceId = traceId 
        };
}
