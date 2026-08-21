using System.ComponentModel.DataAnnotations;

namespace Mojjo.Application.DTOs.Inventory;

public class InventoryStockDto
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public string ProductTitle { get; set; } = string.Empty;
    public int PhysicalStock { get; set; }
    public int ReservedStock { get; set; }
    public int SoldStock { get; set; }
    public int AvailableStock { get; set; }
    public int LowStockThreshold { get; set; }
    public bool InStock { get; set; }
    public bool IsLowStock { get; set; }
    public bool IsOutOfStock { get; set; }
}

public class AdjustStockRequest
{
    [Required]
    public string ProductId { get; set; } = string.Empty;

    /// <summary>
    /// Quantity difference (positive to add stock e.g. +50, negative to deduct stock e.g. -5).
    /// </summary>
    [Required]
    public int QuantityDelta { get; set; }

    [Required]
    public string Reason { get; set; } = "restock"; // restock | damage | expiry | return | manual

    public string? Note { get; set; }
}

public class StockAdjustmentLogDto
{
    public string Id { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public string ProductTitle { get; set; } = string.Empty;
    public int PreviousPhysicalStock { get; set; }
    public int NewPhysicalStock { get; set; }
    public int QuantityChanged { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string? OperatorName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReserveStockItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
