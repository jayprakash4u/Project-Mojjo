using Mojjo.Domain.Common;
using Mojjo.Domain.Enums;

namespace Mojjo.Domain.Entities;

public class OrderStatusHistory : BaseEntity
{
    public string OrderId { get; set; } = string.Empty;
    public Order? Order { get; set; }

    public OrderStatus FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public string? Note { get; set; }
    public string? ChangedByUserId { get; set; }
    public string? ChangedByName { get; set; }
    public string? ChangedByRole { get; set; }
}
