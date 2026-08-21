using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Auth;
using Mojjo.Application.Interfaces.Identity;
using Mojjo.Domain.Constants;

namespace Mojjo.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/users")]
[Authorize(Roles = AppRoles.Admin)]
[EnableRateLimiting("general-api")]
public class UsersAdminController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public UsersAdminController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    /// <summary>
    /// List all registered users in the system (Admin only).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserAdminDto>>>> GetAllUsers(CancellationToken cancellationToken)
    {
        var result = await _identityService.GetAllUsersAsync(cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Assign a specific role to a user (Admin only).
    /// </summary>
    [HttpPost("assign-role")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignRole([FromBody] UserRoleUpdateRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.AssignRoleAsync(request.UserId, request.Role, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Remove a specific role from a user (Admin only).
    /// </summary>
    [HttpPost("remove-role")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveRole([FromBody] UserRoleUpdateRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.RemoveRoleAsync(request.UserId, request.Role, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Toggle account lockout status (Admin only).
    /// </summary>
    [HttpPost("{userId}/toggle-lockout")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleLockout(string userId, [FromQuery] bool lockout, CancellationToken cancellationToken)
    {
        var result = await _identityService.ToggleLockoutAsync(userId, lockout, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}
