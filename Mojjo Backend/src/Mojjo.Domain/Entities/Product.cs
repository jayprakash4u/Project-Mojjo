using Mojjo.Domain.Common;
using Mojjo.Domain.Enums;

namespace Mojjo.Domain.Entities;

public class Product : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    
    public string CategoryId { get; set; } = string.Empty;
    public Category? Category { get; set; }

    public string? SubcategoryId { get; set; }
    public Subcategory? Subcategory { get; set; }

    /// <summary>
    /// Current selling price in NPR.
    /// </summary>
    public decimal Price { get; set; }

    /// <summary>
    /// Pre-discount price. Present only when the item is on offer.
    /// </summary>
    public decimal? OriginalPrice { get; set; }

    public string Image { get; set; } = string.Empty;
    public double Rating { get; set; } = 5.0;
    public int ReviewCount { get; set; } = 0;
    public ProductBadge? Badge { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Volume { get; set; }
    public string? Origin { get; set; }
    public int RewardCoins { get; set; } = 0;
    public bool AgeRestricted { get; set; } = false;

    // Inventory & Real-Time Stock Breakdown
    public int PhysicalStock { get; set; } = 100;
    public int ReservedStock { get; set; } = 0;
    public int SoldStock { get; set; } = 0;
    public int LowStockThreshold { get; set; } = 5;

    public int AvailableStock => Math.Max(0, PhysicalStock - ReservedStock - SoldStock);
    public bool InStock => AvailableStock > 0;
    public bool IsLowStock => AvailableStock <= LowStockThreshold && AvailableStock > 0;
    public bool IsOutOfStock => AvailableStock <= 0;

    /// <summary>
    /// Optimistic concurrency token (RowVersion) to prevent lost updates during high traffic.
    /// </summary>
    public byte[]? RowVersion { get; set; }

    public ICollection<ProductDetail> Details { get; set; } = new List<ProductDetail>();
    public ICollection<StockReservation> StockReservations { get; set; } = new List<StockReservation>();
    public ICollection<StockAdjustmentLog> StockAdjustments { get; set; } = new List<StockAdjustmentLog>();
}
