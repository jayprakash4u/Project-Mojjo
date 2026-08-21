using Mojjo.Domain.Common;
using Mojjo.Domain.Enums;

namespace Mojjo.Domain.Entities;

public class PaymentTransaction : BaseEntity
{
    public string OrderId { get; set; } = string.Empty;
    public Order? Order { get; set; }

    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public PaymentGateway Gateway { get; set; } = PaymentGateway.Cod;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "NPR";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    /// <summary>
    /// Unique merchant transaction reference for tracking and idempotency.
    /// </summary>
    public string TransactionUuid { get; set; } = string.Empty;

    /// <summary>
    /// Gateway's unique payment initiation token or identifier (e.g. Khalti PIDX).
    /// </summary>
    public string? Pidx { get; set; }

    /// <summary>
    /// Gateway's final transaction ID after successful verification.
    /// </summary>
    public string? GatewayTransactionId { get; set; }

    /// <summary>
    /// Timestamp when server-to-server gateway verification was completed.
    /// </summary>
    public DateTime? VerifiedAt { get; set; }

    /// <summary>
    /// Audit log containing sanitized raw response from the gateway for dispute verification.
    /// </summary>
    public string? GatewayResponseRaw { get; set; }

    public string? FailureReason { get; set; }
}
