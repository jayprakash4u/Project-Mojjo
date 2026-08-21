namespace Mojjo.Application.DTOs.Orders;

public class OrderItemDto
{
    public string Id { get; set; } = string.Empty;
    public string? ProductId { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal? OriginalUnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public int RewardCoinsEarned { get; set; }
}

public class ShippingAddressDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public string City { get; set; } = "Kathmandu";
    public string Area { get; set; } = string.Empty;
    public string? Landmark { get; set; }
}

public class OrderStatusHistoryDto
{
    public string Id { get; set; } = string.Empty;
    public string FromStatus { get; set; } = string.Empty;
    public string ToStatus { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string? ChangedByName { get; set; }
    public string? ChangedByRole { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OrderDto
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string DeliveryMethod { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;

    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Total { get; set; }
    public int EarnedCoins { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? PreparingAt { get; set; }
    public DateTime? OutForDeliveryAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? EstimatedArrival { get; set; }

    public string? DeliveryAgentName { get; set; }
    public string? DeliveryAgentPhone { get; set; }

    public ShippingAddressDto Address { get; set; } = new();
    public List<OrderItemDto> Items { get; set; } = new();
    public List<OrderStatusHistoryDto> StatusTimeline { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
}

public class CreateOrderRequest
{
    public string? UserId { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
    public ShippingAddressDto Address { get; set; } = new();
    public string DeliveryMethod { get; set; } = "standard"; // standard | express
    public string PaymentMethod { get; set; } = "cod"; // cod | esewa | khalti
    public decimal DiscountAmount { get; set; } = 0;
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string? DeliveryAgentId { get; set; }
    public string? DeliveryAgentName { get; set; }
    public string? DeliveryAgentPhone { get; set; }
    public string? CancellationReason { get; set; }
}
