using Mojjo.Domain.Common;
using Mojjo.Domain.Enums;

namespace Mojjo.Domain.Entities;

public class StockAdjustmentLog : BaseEntity
{
    public string ProductId { get; set; } = string.Empty;
    public Product? Product { get; set; }

    public int PreviousPhysicalStock { get; set; }
    public int NewPhysicalStock { get; set; }
    public int QuantityChanged { get; set; }

    public StockAdjustmentReason Reason { get; set; }
    public string? Note { get; set; }

    public string? OperatorUserId { get; set; }
    public string? OperatorName { get; set; }
}
