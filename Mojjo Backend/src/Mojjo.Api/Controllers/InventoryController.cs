using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Inventory;
using Mojjo.Application.Interfaces.Identity;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Constants;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    private readonly ICurrentUserService _currentUserService;

    public InventoryController(IInventoryService inventoryService, ICurrentUserService currentUserService)
    {
        _inventoryService = inventoryService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get real-time stock levels for a specific product.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<ApiResponse<InventoryStockDto>>> GetProductStock(string productId, CancellationToken cancellationToken)
    {
        var result = await _inventoryService.GetProductStockAsync(productId, cancellationToken);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Get all low-stock products requiring restock (Admin, Manager, Seller).
    /// </summary>
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager},{AppRoles.Seller}")]
    [HttpGet("low-stock")]
    public async Task<ActionResult<ApiResponse<List<InventoryStockDto>>>> GetLowStockProducts(CancellationToken cancellationToken)
    {
        var result = await _inventoryService.GetLowStockProductsAsync(cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Adjust inventory stock levels (Restock, Damaged, Return, or Manual Correction).
    /// </summary>
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager},{AppRoles.Seller}")]
    [HttpPost("adjust")]
    public async Task<ActionResult<ApiResponse<InventoryStockDto>>> AdjustStock(
        [FromBody] AdjustStockRequest request,
        CancellationToken cancellationToken)
    {
        var operatorId = _currentUserService.UserId;
        var operatorName = _currentUserService.Email ?? "Staff";

        var result = await _inventoryService.AdjustStockAsync(request, operatorId, operatorName, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Get inventory adjustment audit logs.
    /// </summary>
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager},{AppRoles.Seller}")]
    [HttpGet("logs")]
    public async Task<ActionResult<ApiResponse<List<StockAdjustmentLogDto>>>> GetAdjustmentLogs(
        [FromQuery] string? productId,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.GetAdjustmentLogsAsync(productId, cancellationToken);
        return Ok(result);
    }
}
