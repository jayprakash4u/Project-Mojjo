using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Audit;
using Mojjo.Application.DTOs.Orders;
using Mojjo.Application.Interfaces.Hubs;
using Mojjo.Application.Interfaces.Identity;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Constants;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IOrderNotificationService _orderNotificationService;
    private readonly IAuditService _auditService;

    public OrdersController(
        IOrderService orderService, 
        ICurrentUserService currentUserService,
        IOrderNotificationService orderNotificationService,
        IAuditService auditService)
    {
        _orderService = orderService;
        _currentUserService = currentUserService;
        _orderNotificationService = orderNotificationService;
        _auditService = auditService;
    }

    /// <summary>
    /// Place a new order with immutable price snapshot (Authorized Customers and Admins).
    /// </summary>
    [Authorize(Roles = $"{AppRoles.Customer},{AppRoles.Admin}")]
    [EnableRateLimiting("payment-policy")]
    [Filters.Idempotent]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderDto>>> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        if (request.Items == null || !request.Items.Any())
        {
            return BadRequest(ApiResponse<OrderDto>.Fail("Order must contain at least one item."));
        }

        if (string.IsNullOrEmpty(request.UserId) && !string.IsNullOrEmpty(_currentUserService.UserId))
        {
            request.UserId = _currentUserService.UserId;
        }

        var order = await _orderService.CreateOrderAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetOrderById), new { version = "1", id = order.Id }, ApiResponse<OrderDto>.Ok(order, "Order placed successfully!"));
    }

    /// <summary>
    /// Get order details and tracker timeline by Order ID.
    /// </summary>
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrderById(string id, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderByIdAsync(id, cancellationToken);
        if (order == null)
        {
            throw new Application.Common.Exceptions.NotFoundException("Order", id);
        }

        return Ok(ApiResponse<OrderDto>.Ok(order));
    }

    /// <summary>
    /// Get order details and tracker timeline by human-friendly Order Number (e.g. MOJJO-20260821-4829).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("number/{orderNumber}")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrderByNumber(string orderNumber, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderByNumberAsync(orderNumber, cancellationToken);
        if (order == null)
        {
            throw new Application.Common.Exceptions.NotFoundException("Order", orderNumber);
        }

        return Ok(ApiResponse<OrderDto>.Ok(order));
    }

    /// <summary>
    /// Get paginated order history for a specific user (page=1 and pageSize=20).
    /// </summary>
    [Authorize]
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<PagedResult<OrderDto>>>> GetUserOrders(
        string userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentUserService.UserId;
        var isAdminOrManager = _currentUserService.IsInRole(AppRoles.Admin) || _currentUserService.IsInRole(AppRoles.Manager);

        if (!isAdminOrManager && currentUserId != userId)
        {
            return Forbid();
        }

        var pagedOrders = await _orderService.GetUserOrdersAsync(userId, page, pageSize, cancellationToken);
        return Ok(ApiResponse<PagedResult<OrderDto>>.Ok(pagedOrders));
    }

    /// <summary>
    /// Update status of an existing order with audit timeline logging (Admin, Manager, or DeliveryAgent only).
    /// </summary>
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager},{AppRoles.DeliveryAgent}")]
    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateStatus(
        string id,
        [FromBody] UpdateOrderStatusRequest request,
        CancellationToken cancellationToken)
    {
        var operatorId = _currentUserService.UserId;
        var operatorName = _currentUserService.Email ?? "Staff";
        var operatorRole = _currentUserService.Roles.FirstOrDefault() ?? "Admin";

        var order = await _orderService.UpdateOrderStatusAsync(
            id,
            request,
            operatorId,
            operatorName,
            operatorRole,
            cancellationToken);

        if (order == null)
        {
            return NotFound(ApiResponse<OrderDto>.Fail("Order not found or status invalid."));
        }

        // Broadcast real-time push notification to connected customer and mobile app
        await _orderNotificationService.NotifyOrderStatusChangedAsync(new OrderTrackingUpdateDto
        {
            OrderId = order.Id,
            Status = order.Status,
            Note = request.Note,
            EstimatedDeliveryTime = order.EstimatedArrival,
            UpdatedAt = DateTime.UtcNow
        }, cancellationToken);

        // Record administrative audit trail entry
        await _auditService.LogAsync(new AuditLogEntryDto
        {
            UserId = operatorId ?? "anonymous",
            UserEmail = operatorName,
            UserRole = operatorRole,
            Action = "ORDER_STATUS_CHANGED",
            ResourceType = "Order",
            ResourceId = order.Id,
            OldValues = new { note = "Status updated" },
            NewValues = new { status = order.Status, note = request.Note },
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        }, cancellationToken);

        return Ok(ApiResponse<OrderDto>.Ok(order, "Status updated successfully."));
    }
}
