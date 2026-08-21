using System.Net;

namespace Mojjo.Application.Common.Exceptions;

public abstract class AppException : Exception
{
    public HttpStatusCode StatusCode { get; }
    public string ErrorCode { get; }
    public List<string> Errors { get; }

    protected AppException(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest, string errorCode = "BAD_REQUEST", List<string>? errors = null) 
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
        Errors = errors ?? new List<string> { message };
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) 
        : base(message, HttpStatusCode.NotFound, "NOT_FOUND") { }

    public NotFoundException(string entityName, object key) 
        : base($"{entityName} with identifier '{key}' was not found.", HttpStatusCode.NotFound, $"{entityName.ToUpperInvariant()}_NOT_FOUND") { }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message, string errorCode = "BAD_REQUEST") 
        : base(message, HttpStatusCode.BadRequest, errorCode) { }

    public BadRequestException(IEnumerable<string> errors, string errorCode = "BAD_REQUEST") 
        : base(errors.FirstOrDefault() ?? "Bad request.", HttpStatusCode.BadRequest, errorCode, errors.ToList()) { }
}

public class InsufficientStockException : AppException
{
    public InsufficientStockException(string productTitle, int availableStock, int requestedQuantity) 
        : base($"Insufficient stock for '{productTitle}'. Only {availableStock} unit(s) available (requested: {requestedQuantity}).", 
               HttpStatusCode.BadRequest, 
               "INSUFFICIENT_STOCK") { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "You are not authorized to perform this action.") 
        : base(message, HttpStatusCode.Unauthorized, "UNAUTHORIZED") { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "You do not have permission to access this resource.") 
        : base(message, HttpStatusCode.Forbidden, "FORBIDDEN") { }
}

public class ConflictException : AppException
{
    public ConflictException(string message, string errorCode = "CONFLICT") 
        : base(message, HttpStatusCode.Conflict, errorCode) { }
}
