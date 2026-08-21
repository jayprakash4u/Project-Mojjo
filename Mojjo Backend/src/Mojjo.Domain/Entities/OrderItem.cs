using Mojjo.Domain.Common;

namespace Mojjo.Domain.Entities;

public class OrderItem : BaseEntity
{
    public string OrderId { get; set; } = string.Empty;
    public Order? Order { get; set; }

    /// <summary>
    /// Reference to product. Nullable so order history remains intact even if a catalog product is deleted.
    /// </summary>
    public string? ProductId { get; set; }
    public Product? Product { get; set; }

    /// <summary>
    /// Product title at the time of purchase.
    /// </summary>
    public string ProductTitle { get; set; } = string.Empty;

    /// <summary>
    /// Product slug at the time of purchase.
    /// </summary>
    public string ProductSlug { get; set; } = string.Empty;

    /// <summary>
    /// Product image at the time of purchase.
    /// </summary>
    public string ProductImage { get; set; } = string.Empty;

    /// <summary>
    /// Exact unit price charged at the time of purchase.
    /// If price changes in catalog tomorrow, this historical unit price remains immutable.
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Pre-discount original price per unit at the time of purchase.
    /// </summary>
    public decimal? OriginalUnitPrice { get; set; }

    /// <summary>
    /// Quantity ordered.
    /// </summary>
    public int Quantity { get; set; } = 1;

    /// <summary>
    /// Total price for this line item (UnitPrice * Quantity).
    /// </summary>
    public decimal TotalPrice { get; set; }

    /// <summary>
    /// Reward coins earned for this item line.
    /// </summary>
    public int RewardCoinsEarned { get; set; }
}
