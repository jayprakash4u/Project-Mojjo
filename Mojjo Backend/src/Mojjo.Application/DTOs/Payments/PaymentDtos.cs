using System.ComponentModel.DataAnnotations;

namespace Mojjo.Application.DTOs.Payments;

public class InitiatePaymentRequest
{
    [Required]
    public string OrderId { get; set; } = string.Empty;

    [Required]
    public string Gateway { get; set; } = string.Empty; // esewa | khalti
}

public class InitiatePaymentResponseDto
{
    public string OrderId { get; set; } = string.Empty;
    public string Gateway { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string TransactionUuid { get; set; } = string.Empty;
    public string? Pidx { get; set; }
    public string? PaymentUrl { get; set; }
    public Dictionary<string, string> FormData { get; set; } = new();
}

public class VerifyEsewaPaymentRequest
{
    [Required]
    public string Data { get; set; } = string.Empty; // Base64 encoded payload returned by eSewa
}

public class VerifyKhaltiPaymentRequest
{
    [Required]
    public string Pidx { get; set; } = string.Empty;
}

public class PaymentVerificationResultDto
{
    public bool Success { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public string Gateway { get; set; } = string.Empty;
    public string? GatewayTransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class PaymentStatusDto
{
    public string OrderId { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public List<PaymentTransactionSummaryDto> Transactions { get; set; } = new();
}

public class PaymentTransactionSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string Gateway { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string TransactionUuid { get; set; } = string.Empty;
    public string? GatewayTransactionId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
}
