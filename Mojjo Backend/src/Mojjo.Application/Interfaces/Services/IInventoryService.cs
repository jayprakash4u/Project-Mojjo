using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Inventory;

namespace Mojjo.Application.Interfaces.Services;

public interface IInventoryService
{
    Task<ApiResponse<bool>> ReserveStockForOrderAsync(string orderId, List<ReserveStockItemRequest> items, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> CommitOrderStockAsync(string orderId, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> ReleaseOrderStockAsync(string orderId, CancellationToken cancellationToken = default);
    Task<ApiResponse<InventoryStockDto>> GetProductStockAsync(string productId, CancellationToken cancellationToken = default);
    Task<ApiResponse<List<InventoryStockDto>>> GetLowStockProductsAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<InventoryStockDto>> AdjustStockAsync(AdjustStockRequest request, string? operatorUserId = null, string? operatorName = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<List<StockAdjustmentLogDto>>> GetAdjustmentLogsAsync(string? productId = null, CancellationToken cancellationToken = default);
    Task<int> ReleaseExpiredReservationsAsync(CancellationToken cancellationToken = default);
}
