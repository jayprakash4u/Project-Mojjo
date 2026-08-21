using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Notifications;
using Mojjo.Application.Interfaces.Identity;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[EnableRateLimiting("general-api")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public NotificationsController(INotificationService notificationService, ICurrentUserService currentUserService)
    {
        _notificationService = notificationService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated notifications for the authenticated user (page=1 and pageSize=20).
    /// </summary>
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<NotificationDto>>>> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        var notifications = await _notificationService.GetNotificationsAsync(userId, page, pageSize, cancellationToken);
        return Ok(ApiResponse<PagedResult<NotificationDto>>.Ok(notifications));
    }

    /// <summary>
    /// Mark a notification as read.
    /// </summary>
    [Authorize]
    [HttpPut("{id}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(string id, CancellationToken cancellationToken)
    {
        var success = await _notificationService.MarkAsReadAsync(id, cancellationToken);
        return Ok(ApiResponse<bool>.Ok(success));
    }

    /// <summary>
    /// Mark all notifications as read.
    /// </summary>
    [Authorize]
    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var success = await _notificationService.MarkAllAsReadAsync(userId, cancellationToken);
        return Ok(ApiResponse<bool>.Ok(success));
    }
}
