using Mojjo.Application.DTOs.Payments;

namespace Mojjo.Application.Interfaces.External;

public class EsewaInitiateResult
{
    public string TransactionUuid { get; set; } = string.Empty;
    public string PaymentUrl { get; set; } = string.Empty;
    public Dictionary<string, string> FormData { get; set; } = new();
}

public class EsewaVerificationResult
{
    public bool IsValid { get; set; }
    public string Status { get; set; } = string.Empty; // COMPLETE, PENDING, FAILED
    public string TransactionUuid { get; set; } = string.Empty;
    public string? RefId { get; set; }
    public decimal TotalAmount { get; set; }
    public string RawResponse { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}

public interface IEsewaPaymentGateway
{
    EsewaInitiateResult GenerateInitiatePayload(string orderId, decimal amount, string transactionUuid);
    Task<EsewaVerificationResult> VerifyTransactionAsync(string encodedData, CancellationToken cancellationToken = default);
}

public class KhaltiInitiateResult
{
    public string Pidx { get; set; } = string.Empty;
    public string PaymentUrl { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
}

public class KhaltiVerificationResult
{
    public bool IsValid { get; set; }
    public string Status { get; set; } = string.Empty; // Completed, Pending, User canceled, Expired
    public string Pidx { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public decimal TotalAmountInPaisa { get; set; }
    public string RawResponse { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}

public interface IKhaltiPaymentGateway
{
    Task<KhaltiInitiateResult> InitiatePaymentAsync(string orderId, decimal amount, string purchaseOrderName, CancellationToken cancellationToken = default);
    Task<KhaltiVerificationResult> LookupPaymentAsync(string pidx, CancellationToken cancellationToken = default);
}
