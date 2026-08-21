using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Rewards;
using Mojjo.Application.Interfaces.Identity;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Constants;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[EnableRateLimiting("general-api")]
public class RewardsController : ControllerBase
{
    private readonly IRewardService _rewardService;
    private readonly ICurrentUserService _currentUserService;

    public RewardsController(IRewardService rewardService, ICurrentUserService currentUserService)
    {
        _rewardService = rewardService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get user's Mojjo Coin balance and transaction history.
    /// </summary>
    [Authorize]
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<RewardsSummaryDto>>> GetUserRewards(string userId, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        var isAdmin = _currentUserService.IsInRole(AppRoles.Admin);

        if (!isAdmin && currentUserId != userId)
        {
            return Forbid();
        }

        var rewards = await _rewardService.GetUserRewardsAsync(userId, cancellationToken);
        return Ok(ApiResponse<RewardsSummaryDto>.Ok(rewards));
    }
}
