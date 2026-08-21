namespace Mojjo.Application.Interfaces.Infrastructure;

public class IdempotencyAcquireResult
{
    public bool IsAcquired { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsProcessing { get; set; }
    public bool IsMismatch { get; set; }
    public int? StatusCode { get; set; }
    public string? ResponseBody { get; set; }

    public static IdempotencyAcquireResult Acquired() 
        => new() { IsAcquired = true };

    public static IdempotencyAcquireResult Processing() 
        => new() { IsProcessing = true };

    public static IdempotencyAcquireResult Completed(int statusCode, string responseBody) 
        => new() { IsCompleted = true, StatusCode = statusCode, ResponseBody = responseBody };

    public static IdempotencyAcquireResult Mismatch() 
        => new() { IsMismatch = true };
}

public interface IIdempotencyService
{
    Task<IdempotencyAcquireResult> TryAcquireAsync(string key, string userId, string requestPath, string requestPayload, CancellationToken cancellationToken = default);
    Task SaveResponseAsync(string key, string userId, int statusCode, string responseBody, CancellationToken cancellationToken = default);
    Task MarkFailedAsync(string key, string userId, CancellationToken cancellationToken = default);
}
