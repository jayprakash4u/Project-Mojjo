using Mojjo.Domain.Common;
using Mojjo.Domain.Enums;

namespace Mojjo.Domain.Entities;

public class Order : BaseEntity
{
    /// <summary>
    /// Human-friendly tracking number (e.g. MOJJO-20260821-4829).
    /// </summary>
    public string OrderNumber { get; set; } = string.Empty;

    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Confirmed;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public DeliveryMethod DeliveryMethod { get; set; } = DeliveryMethod.Standard;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cod;

    // Financial Breakdown
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal Total { get; set; }
    public int EarnedCoins { get; set; }

    // Multi-stage Lifecycle Timestamps
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? PreparingAt { get; set; }
    public DateTime? OutForDeliveryAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? EstimatedArrival { get; set; }

    // Delivery Agent / Rider Assignment
    public string? DeliveryAgentId { get; set; }
    public string? DeliveryAgentName { get; set; }
    public string? DeliveryAgentPhone { get; set; }

    // Snapshot Destination Address
    public ShippingAddress Address { get; set; } = new();

    // Line Items & Audit Relationships
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<PaymentTransaction> Payments { get; set; } = new List<PaymentTransaction>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
}
