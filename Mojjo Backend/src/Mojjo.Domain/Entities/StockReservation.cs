using Mojjo.Domain.Common;
using Mojjo.Domain.Enums;

namespace Mojjo.Domain.Entities;

public class StockReservation : BaseEntity
{
    public string OrderId { get; set; } = string.Empty;
    public Order? Order { get; set; }

    public string ProductId { get; set; } = string.Empty;
    public Product? Product { get; set; }

    public int Quantity { get; set; }
    public StockReservationStatus Status { get; set; } = StockReservationStatus.Active;

    public DateTime ExpiresAt { get; set; }
    public DateTime? ReleasedAt { get; set; }
    public DateTime? CommittedAt { get; set; }

    public bool IsExpired => Status == StockReservationStatus.Active && DateTime.UtcNow > ExpiresAt;
}
