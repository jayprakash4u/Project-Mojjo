using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Delivery;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[EnableRateLimiting("general-api")]
public class DeliveryController : ControllerBase
{
    private readonly IDeliveryService _deliveryService;

    public DeliveryController(IDeliveryService deliveryService)
    {
        _deliveryService = deliveryService;
    }

    /// <summary>
    /// Get all serviceable delivery areas in Kathmandu Valley (Public).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("areas")]
    public async Task<ActionResult<ApiResponse<List<DeliveryAreaDto>>>> GetAreas(CancellationToken cancellationToken)
    {
        var areas = await _deliveryService.GetDeliveryAreasAsync(cancellationToken);
        return Ok(ApiResponse<List<DeliveryAreaDto>>.Ok(areas));
    }

    /// <summary>
    /// Check delivery availability and ETA for a specific location (Public).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("check")]
    public async Task<ActionResult<ApiResponse<DeliveryAreaDto?>>> CheckArea([FromQuery] string area, CancellationToken cancellationToken)
    {
        var result = await _deliveryService.CheckAreaAvailabilityAsync(area, cancellationToken);
        if (result == null)
        {
            return Ok(ApiResponse<DeliveryAreaDto?>.Ok(null, "Area is currently outside our 45-minute delivery radius."));
        }

        return Ok(ApiResponse<DeliveryAreaDto?>.Ok(result, "Area is serviceable!"));
    }
}
