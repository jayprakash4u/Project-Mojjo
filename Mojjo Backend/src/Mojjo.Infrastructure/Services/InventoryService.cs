using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Inventory;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Entities;
using Mojjo.Domain.Enums;
using Mojjo.Infrastructure.Persistence;

namespace Mojjo.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly MojjoDbContext _context;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(MojjoDbContext context, ILogger<InventoryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<bool>> ReserveStockForOrderAsync(string orderId, List<ReserveStockItemRequest> items, CancellationToken cancellationToken = default)
    {
        if (items == null || !items.Any())
            return ApiResponse<bool>.Ok(true);

        // Begin transaction with RepeatableRead isolation for strong concurrency consistency
        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
        try
        {
            var productIds = items.Select(i => i.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, cancellationToken);

            var reservations = new List<StockReservation>();

            foreach (var item in items)
            {
                if (!products.TryGetValue(item.ProductId, out var product))
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return ApiResponse<bool>.Fail($"Product ({item.ProductId}) not found.");
                }

                // Mathematical Concurrency & Overselling Check
                var available = product.AvailableStock;
                if (available < item.Quantity)
                {
                    _logger.LogWarning("Overselling blocked for '{Title}'. Available: {Avail}, Requested: {Req}", product.Title, available, item.Quantity);
                    await transaction.RollbackAsync(cancellationToken);
                    return ApiResponse<bool>.Fail($"Insufficient stock for '{product.Title}'. Only {available} unit(s) available.");
                }

                // Increment Reserved Stock
                product.ReservedStock += item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;

                reservations.Add(new StockReservation
                {
                    OrderId = orderId,
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    Status = StockReservationStatus.Active,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(20)
                });
            }

            _context.StockReservations.AddRange(reservations);
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Stock reserved successfully for Order {OrderId}", orderId);
            return ApiResponse<bool>.Ok(true, "Stock reserved successfully.");
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict during stock reservation for Order {OrderId}", orderId);
            await transaction.RollbackAsync(cancellationToken);
            return ApiResponse<bool>.Fail("Item stock was updated by another concurrent purchase. Please try again.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during stock reservation for Order {OrderId}", orderId);
            await transaction.RollbackAsync(cancellationToken);
            return ApiResponse<bool>.Fail($"Stock reservation failed: {ex.Message}");
        }
    }

    public async Task<ApiResponse<bool>> CommitOrderStockAsync(string orderId, CancellationToken cancellationToken = default)
    {
        var reservations = await _context.StockReservations
            .Include(r => r.Product)
            .Where(r => r.OrderId == orderId && r.Status == StockReservationStatus.Active)
            .ToListAsync(cancellationToken);

        if (!reservations.Any())
            return ApiResponse<bool>.Ok(true, "No active stock reservations to commit.");

        foreach (var res in reservations)
        {
            if (res.Product != null)
            {
                // Convert from Reserved to Sold
                res.Product.ReservedStock = Math.Max(0, res.Product.ReservedStock - res.Quantity);
                res.Product.SoldStock += res.Quantity;
                res.Product.UpdatedAt = DateTime.UtcNow;

                _context.StockAdjustmentLogs.Add(new StockAdjustmentLog
                {
                    ProductId = res.ProductId,
                    PreviousPhysicalStock = res.Product.PhysicalStock,
                    NewPhysicalStock = res.Product.PhysicalStock,
                    QuantityChanged = res.Quantity,
                    Reason = StockAdjustmentReason.Sale,
                    Note = $"Sold via Order #{orderId[..8].ToUpper()}",
                    OperatorName = "System (Order Confirmation)"
                });
            }

            res.Status = StockReservationStatus.Committed;
            res.CommittedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Stock committed for Order {OrderId}", orderId);

        return ApiResponse<bool>.Ok(true, "Stock committed successfully.");
    }

    public async Task<ApiResponse<bool>> ReleaseOrderStockAsync(string orderId, CancellationToken cancellationToken = default)
    {
        var reservations = await _context.StockReservations
            .Include(r => r.Product)
            .Where(r => r.OrderId == orderId && r.Status == StockReservationStatus.Active)
            .ToListAsync(cancellationToken);

        if (!reservations.Any())
            return ApiResponse<bool>.Ok(true, "No active stock reservations to release.");

        foreach (var res in reservations)
        {
            if (res.Product != null)
            {
                res.Product.ReservedStock = Math.Max(0, res.Product.ReservedStock - res.Quantity);
                res.Product.UpdatedAt = DateTime.UtcNow;
            }

            res.Status = StockReservationStatus.Released;
            res.ReleasedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Stock released back to available for Order {OrderId}", orderId);

        return ApiResponse<bool>.Ok(true, "Stock released successfully.");
    }

    public async Task<ApiResponse<InventoryStockDto>> GetProductStockAsync(string productId, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        if (product == null)
            return ApiResponse<InventoryStockDto>.Fail("Product not found.");

        return ApiResponse<InventoryStockDto>.Ok(MapToStockDto(product));
    }

    public async Task<ApiResponse<List<InventoryStockDto>>> GetLowStockProductsAsync(CancellationToken cancellationToken = default)
    {
        var products = await _context.Products
            .AsNoTracking()
            .Where(p => (p.PhysicalStock - p.ReservedStock - p.SoldStock) <= p.LowStockThreshold)
            .OrderBy(p => (p.PhysicalStock - p.ReservedStock - p.SoldStock))
            .ToListAsync(cancellationToken);

        return ApiResponse<List<InventoryStockDto>>.Ok(products.Select(MapToStockDto).ToList());
    }

    public async Task<ApiResponse<InventoryStockDto>> AdjustStockAsync(
        AdjustStockRequest request,
        string? operatorUserId = null,
        string? operatorName = null,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
        if (product == null)
            return ApiResponse<InventoryStockDto>.Fail("Product not found.");

        var oldStock = product.PhysicalStock;
        var newStock = Math.Max(0, product.PhysicalStock + request.QuantityDelta);

        product.PhysicalStock = newStock;
        product.UpdatedAt = DateTime.UtcNow;

        if (!Enum.TryParse<StockAdjustmentReason>(request.Reason, true, out var reasonEnum))
        {
            reasonEnum = StockAdjustmentReason.ManualCorrection;
        }

        _context.StockAdjustmentLogs.Add(new StockAdjustmentLog
        {
            ProductId = product.Id,
            PreviousPhysicalStock = oldStock,
            NewPhysicalStock = newStock,
            QuantityChanged = request.QuantityDelta,
            Reason = reasonEnum,
            Note = request.Note,
            OperatorUserId = operatorUserId,
            OperatorName = operatorName ?? "Admin"
        });

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<InventoryStockDto>.Ok(MapToStockDto(product), "Stock adjusted successfully.");
    }

    public async Task<ApiResponse<List<StockAdjustmentLogDto>>> GetAdjustmentLogsAsync(string? productId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.StockAdjustmentLogs
            .Include(l => l.Product)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrEmpty(productId))
        {
            query = query.Where(l => l.ProductId == productId);
        }

        var logs = await query
            .OrderByDescending(l => l.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);

        var result = logs.Select(l => new StockAdjustmentLogDto
        {
            Id = l.Id,
            ProductId = l.ProductId,
            ProductTitle = l.Product?.Title ?? l.ProductId,
            PreviousPhysicalStock = l.PreviousPhysicalStock,
            NewPhysicalStock = l.NewPhysicalStock,
            QuantityChanged = l.QuantityChanged,
            Reason = l.Reason.ToString(),
            Note = l.Note,
            OperatorName = l.OperatorName,
            CreatedAt = l.CreatedAt
        }).ToList();

        return ApiResponse<List<StockAdjustmentLogDto>>.Ok(result);
    }

    public async Task<int> ReleaseExpiredReservationsAsync(CancellationToken cancellationToken = default)
    {
        var expiredReservations = await _context.StockReservations
            .Where(r => r.Status == StockReservationStatus.Active && r.ExpiresAt < DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        if (!expiredReservations.Any())
        {
            return 0;
        }

        var productIds = expiredReservations.Select(r => r.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted, cancellationToken);
            var releasedCount = 0;

            foreach (var reservation in expiredReservations)
            {
                reservation.Status = StockReservationStatus.Released;

                if (products.TryGetValue(reservation.ProductId, out var product))
                {
                    product.ReservedStock = Math.Max(0, product.ReservedStock - reservation.Quantity);
                    product.UpdatedAt = DateTime.UtcNow;

                    _context.StockAdjustmentLogs.Add(new StockAdjustmentLog
                    {
                        ProductId = reservation.ProductId,
                        PreviousPhysicalStock = product.PhysicalStock,
                        NewPhysicalStock = product.PhysicalStock,
                        QuantityChanged = 0,
                        Reason = StockAdjustmentReason.ReservationRelease,
                        Note = $"Auto-released expired reservation for Order {reservation.OrderId}",
                        OperatorName = "SystemWorker"
                    });
                }

                releasedCount++;
            }

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Released {Count} expired stock reservation(s).", releasedCount);
            return releasedCount;
        });
    }

    private static InventoryStockDto MapToStockDto(Product p) => new()
    {
        ProductId = p.Id,
        ProductSlug = p.Slug,
        ProductTitle = p.Title,
        PhysicalStock = p.PhysicalStock,
        ReservedStock = p.ReservedStock,
        SoldStock = p.SoldStock,
        AvailableStock = p.AvailableStock,
        LowStockThreshold = p.LowStockThreshold,
        InStock = p.InStock,
        IsLowStock = p.IsLowStock,
        IsOutOfStock = p.IsOutOfStock
    };
}
