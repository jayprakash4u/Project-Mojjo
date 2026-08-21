using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Auth;
using Mojjo.Application.Interfaces.Identity;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[EnableRateLimiting("auth-strict")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(IIdentityService identityService, ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Register a new customer, seller, or delivery agent account.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResultDto>>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.RegisterAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Login with email/phone and password to obtain JWT and Refresh token.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResultDto>>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.LoginAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Refresh an expired JWT access token using a valid, single-use refresh token.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResultDto>>> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.RefreshTokenAsync(request, cancellationToken);
        if (!result.Success)
            return Unauthorized(result);

        return Ok(result);
    }

    /// <summary>
    /// Revoke a refresh token upon logout.
    /// </summary>
    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<ActionResult<ApiResponse<bool>>> RevokeToken([FromBody] RevokeTokenRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.RevokeTokenAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Change password for authenticated user.
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<bool>.Fail("User is not authenticated."));

        var result = await _identityService.ChangePasswordAsync(userId, request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Request a password reset token.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<string>>> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.ForgotPasswordAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Reset password using a valid reset token.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.ResetPasswordAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Step 1: Send a 6-digit OTP code to mobile phone for passwordless signup and login.
    /// </summary>
    [AllowAnonymous]
    [EnableRateLimiting("otp-policy")]
    [HttpPost("send-otp")]
    public async Task<ActionResult<ApiResponse<SendOtpResponseDto>>> SendOtp([FromBody] SendOtpRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.SendPhoneOtpAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Step 2: Verify mobile phone OTP code and log in / auto-signup instantly (Passwordless).
    /// </summary>
    [AllowAnonymous]
    [EnableRateLimiting("otp-policy")]
    [HttpPost("verify-otp")]
    public async Task<ActionResult<ApiResponse<AuthResultDto>>> VerifyOtp([FromBody] PhoneLoginOtpRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.LoginOrRegisterWithPhoneOtpAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Verify phone number OTP.
    /// </summary>
    [AllowAnonymous]
    [EnableRateLimiting("otp-policy")]
    [HttpPost("verify-phone")]
    public async Task<ActionResult<ApiResponse<bool>>> VerifyPhone([FromBody] VerifyPhoneOtpRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.VerifyPhoneOtpAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Get authenticated user's profile, roles, and address book.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetMe(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<UserProfileDto>.Fail("User is not authenticated."));

        var result = await _identityService.GetUserProfileAsync(userId, cancellationToken);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}
