using Microsoft.EntityFrameworkCore;
using Mojjo.Application.Common;
using Mojjo.Application.Common.Exceptions;
using Mojjo.Application.DTOs.Inventory;
using Mojjo.Application.DTOs.Orders;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Entities;
using Mojjo.Domain.Enums;

namespace Mojjo.Application.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;
    private readonly IInventoryService _inventoryService;

    public OrderService(IApplicationDbContext context, IInventoryService inventoryService)
    {
        _context = context;
        _inventoryService = inventoryService;
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        decimal subtotal = 0;
        int totalCoins = 0;
        var orderItems = new List<OrderItem>();
        var reserveItems = new List<ReserveStockItemRequest>();

        // 1. Snapshot Product & Price Data and check real-time stock
        foreach (var itemReq in request.Items)
        {
            if (products.TryGetValue(itemReq.ProductId, out var product))
            {
                var unitPrice = product.Price; // Current price at moment of purchase
                var qty = Math.Max(1, itemReq.Quantity);

                // Check real-time available stock
                if (product.AvailableStock < qty)
                {
                    throw new BadRequestException($"Insufficient stock for '{product.Title}'. Only {product.AvailableStock} item(s) available.");
                }

                var lineTotal = unitPrice * qty;
                var coins = product.RewardCoins * qty;

                subtotal += lineTotal;
                totalCoins += coins;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductTitle = product.Title,
                    ProductSlug = product.Slug,
                    ProductImage = product.Image,
                    UnitPrice = unitPrice,
                    OriginalUnitPrice = product.OriginalPrice,
                    Quantity = qty,
                    TotalPrice = lineTotal,
                    RewardCoinsEarned = coins
                });

                reserveItems.Add(new ReserveStockItemRequest
                {
                    ProductId = product.Id,
                    Quantity = qty
                });
            }
            else
            {
                throw new NotFoundException("Product", itemReq.ProductId);
            }
        }

        var isExpress = request.DeliveryMethod?.ToLower() == "express";
        decimal deliveryFee = isExpress ? 100 : (subtotal >= 1500 ? 0 : 50);
        decimal discount = Math.Clamp(request.DiscountAmount, 0, subtotal);
        decimal total = subtotal + deliveryFee - discount;

        var deliveryMethod = isExpress ? DeliveryMethod.Express : DeliveryMethod.Standard;
        var paymentMethod = request.PaymentMethod?.ToLower() switch
        {
            "esewa" => PaymentMethod.Esewa,
            "khalti" => PaymentMethod.Khalti,
            _ => PaymentMethod.Cod
        };

        var initialPaymentStatus = paymentMethod == PaymentMethod.Cod ? PaymentStatus.Pending : PaymentStatus.Initiated;
        var orderNumber = $"MOJJO-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = request.UserId,
            Status = OrderStatus.Confirmed,
            PaymentStatus = initialPaymentStatus,
            DeliveryMethod = deliveryMethod,
            PaymentMethod = paymentMethod,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            DiscountAmount = discount,
            Total = total,
            EarnedCoins = totalCoins,
            ConfirmedAt = DateTime.UtcNow,
            EstimatedArrival = DateTime.UtcNow.AddMinutes(isExpress ? 15 : 40),
            Address = new ShippingAddress
            {
                FullName = request.Address.FullName,
                Phone = request.Address.Phone,
                StreetAddress = request.Address.StreetAddress,
                City = string.IsNullOrWhiteSpace(request.Address.City) ? "Kathmandu" : request.Address.City,
                Area = request.Address.Area,
                Landmark = request.Address.Landmark
            },
            Items = orderItems
        };

        order.StatusHistory.Add(new OrderStatusHistory
        {
            FromStatus = OrderStatus.Confirmed,
            ToStatus = OrderStatus.Confirmed,
            Note = "Order placed successfully by customer.",
            ChangedByName = request.Address.FullName,
            ChangedByRole = "Customer"
        });

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        // 2. Perform Atomic Stock Reservation for the Order (Concurrency safe)
        var reserveResult = await _inventoryService.ReserveStockForOrderAsync(order.Id, reserveItems, cancellationToken);
        if (!reserveResult.Success)
        {
            throw new BadRequestException(reserveResult.Message ?? "Failed to reserve inventory stock.");
        }

        // If customer is authenticated, dispatch notification and reward coins
        if (!string.IsNullOrWhiteSpace(request.UserId))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
            if (user != null)
            {
                if (paymentMethod == PaymentMethod.Cod)
                {
                    user.RewardCoinBalance += totalCoins;
                    _context.RewardCoinTransactions.Add(new RewardCoinTransaction
                    {
                        UserId = user.Id,
                        Amount = totalCoins,
                        Reason = $"Earned from Order #{order.OrderNumber}",
                        Type = "earned",
                        ReferenceOrderId = order.Id
                    });
                }

                _context.Notifications.Add(new Notification
                {
                    UserId = user.Id,
                    Title = "Order Placed! 🎉",
                    Message = $"Your order #{order.OrderNumber} for NPR {total:N0} has been confirmed.",
                    Type = "order",
                    Link = $"/order-tracker/{order.Id}"
                });
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        return MapOrderToDto(order);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        return order == null ? null : MapOrderToDto(order);
    }

    public async Task<OrderDto?> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OrderNumber.ToLower() == orderNumber.ToLower(), cancellationToken);

        return order == null ? null : MapOrderToDto(order);
    }

    public async Task<PagedResult<OrderDto>> GetUserOrdersAsync(string userId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var pageNumber = Math.Max(1, page);
        var size = Math.Clamp(pageSize, 1, 50);

        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .AsNoTracking();

        var totalCount = await query.CountAsync(cancellationToken);
        var orders = await query
            .Skip((pageNumber - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<OrderDto>
        {
            Items = orders.Select(MapOrderToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = size
        };
    }

    public async Task<OrderDto?> UpdateOrderStatusAsync(
        string orderId,
        UpdateOrderStatusRequest request,
        string? operatorUserId = null,
        string? operatorName = null,
        string? operatorRole = null,
        CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order == null) return null;

        if (Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
        {
            var oldStatus = order.Status;
            order.Status = newStatus;
            order.UpdatedAt = DateTime.UtcNow;

            switch (newStatus)
            {
                case OrderStatus.Confirmed:
                    order.ConfirmedAt ??= DateTime.UtcNow;
                    break;
                case OrderStatus.Preparing:
                    order.PreparingAt ??= DateTime.UtcNow;
                    break;
                case OrderStatus.OutForDelivery:
                    order.OutForDeliveryAt ??= DateTime.UtcNow;
                    if (!string.IsNullOrEmpty(request.DeliveryAgentId))
                    {
                        order.DeliveryAgentId = request.DeliveryAgentId;
                        order.DeliveryAgentName = request.DeliveryAgentName;
                        order.DeliveryAgentPhone = request.DeliveryAgentPhone;
                    }
                    break;
                case OrderStatus.Delivered:
                    order.DeliveredAt ??= DateTime.UtcNow;
                    if (order.PaymentMethod == PaymentMethod.Cod)
                    {
                        order.PaymentStatus = PaymentStatus.Completed;
                    }
                    // Commit reserved inventory to permanently sold
                    await _inventoryService.CommitOrderStockAsync(order.Id, cancellationToken);
                    break;
                case OrderStatus.Cancelled:
                    order.CancelledAt ??= DateTime.UtcNow;
                    order.CancellationReason = request.CancellationReason ?? request.Note;
                    // Release reserved stock back to available pool
                    await _inventoryService.ReleaseOrderStockAsync(order.Id, cancellationToken);
                    break;
            }

            order.StatusHistory.Add(new OrderStatusHistory
            {
                FromStatus = oldStatus,
                ToStatus = newStatus,
                Note = request.Note ?? $"Order transitioned from {oldStatus} to {newStatus}.",
                ChangedByUserId = operatorUserId,
                ChangedByName = operatorName ?? "System",
                ChangedByRole = operatorRole ?? "Admin"
            });

            if (!string.IsNullOrEmpty(order.UserId))
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = order.UserId,
                    Title = $"Order #{order.OrderNumber} is {newStatus}! 📦",
                    Message = request.Note ?? $"Your order status has been updated to {newStatus}.",
                    Type = "order",
                    Link = $"/order-tracker/{order.Id}"
                });
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        return MapOrderToDto(order);
    }

    private static OrderDto MapOrderToDto(Order o) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        Status = o.Status.ToString().ToLower(),
        PaymentStatus = o.PaymentStatus.ToString().ToLower(),
        DeliveryMethod = o.DeliveryMethod.ToString().ToLower(),
        PaymentMethod = o.PaymentMethod.ToString().ToLower(),
        Subtotal = o.Subtotal,
        DeliveryFee = o.DeliveryFee,
        DiscountAmount = o.DiscountAmount,
        Total = o.Total,
        EarnedCoins = o.EarnedCoins,
        CreatedAt = o.CreatedAt,
        ConfirmedAt = o.ConfirmedAt,
        PreparingAt = o.PreparingAt,
        OutForDeliveryAt = o.OutForDeliveryAt,
        DeliveredAt = o.DeliveredAt,
        CancelledAt = o.CancelledAt,
        CancellationReason = o.CancellationReason,
        EstimatedArrival = o.EstimatedArrival,
        DeliveryAgentName = o.DeliveryAgentName,
        DeliveryAgentPhone = o.DeliveryAgentPhone,
        Address = new ShippingAddressDto
        {
            FullName = o.Address.FullName,
            Phone = o.Address.Phone,
            StreetAddress = o.Address.StreetAddress,
            City = o.Address.City,
            Area = o.Address.Area,
            Landmark = o.Address.Landmark
        },
        Items = o.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductTitle = i.ProductTitle,
            ProductSlug = i.ProductSlug,
            ProductImage = i.ProductImage,
            UnitPrice = i.UnitPrice,
            OriginalUnitPrice = i.OriginalUnitPrice,
            Quantity = i.Quantity,
            TotalPrice = i.TotalPrice,
            RewardCoinsEarned = i.RewardCoinsEarned
        }).ToList(),
        StatusTimeline = o.StatusHistory.OrderBy(s => s.CreatedAt).Select(s => new OrderStatusHistoryDto
        {
            Id = s.Id,
            FromStatus = s.FromStatus.ToString(),
            ToStatus = s.ToStatus.ToString(),
            Note = s.Note,
            ChangedByName = s.ChangedByName,
            ChangedByRole = s.ChangedByRole,
            CreatedAt = s.CreatedAt
        }).ToList()
    };
}
