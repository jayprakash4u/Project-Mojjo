using System.Security.Claims;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Auth;
using Mojjo.Domain.Entities;

namespace Mojjo.Application.Interfaces.Identity;

public interface IIdentityService
{
    Task<ApiResponse<AuthResultDto>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResultDto>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResultDto>> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> RevokeTokenAsync(RevokeTokenRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<SendOtpResponseDto>> SendPhoneOtpAsync(SendOtpRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResultDto>> LoginOrRegisterWithPhoneOtpAsync(PhoneLoginOtpRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> VerifyPhoneOtpAsync(VerifyPhoneOtpRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<UserProfileDto>> GetUserProfileAsync(string userId, CancellationToken cancellationToken = default);
    
    // Administrative User Management
    Task<ApiResponse<List<UserAdminDto>>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> AssignRoleAsync(string userId, string role, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> RemoveRoleAsync(string userId, string role, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> ToggleLockoutAsync(string userId, bool lockout, CancellationToken cancellationToken = default);
}

public interface ITokenService
{
    Task<AuthResultDto> GenerateTokensAsync(ApplicationUser user, IList<string> roles);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    Task<ApiResponse<AuthResultDto>> RotateRefreshTokenAsync(string accessToken, string refreshToken, CancellationToken cancellationToken = default);
    Task<bool> RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
}
