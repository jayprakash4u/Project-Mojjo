using System.ComponentModel.DataAnnotations;
using Mojjo.Application.DTOs.Users;

namespace Mojjo.Application.DTOs.Auth;

public class RegisterRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = string.Empty;

    public string? Role { get; set; }
}

public class LoginRequest
{
    [Required]
    public string EmailOrPhone { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResultDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAt { get; set; }
    public UserProfileDto User { get; set; } = new();
}

public class UserProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int RewardCoinBalance { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public List<UserAddressDto> Addresses { get; set; } = new();
}

public class RefreshTokenRequest
{
    [Required]
    public string AccessToken { get; set; } = string.Empty;

    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class RevokeTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    [Required]
    public string EmailOrPhone { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [Required]
    public string EmailOrPhone { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}

public class SendOtpRequest
{
    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class SendOtpResponseDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsNewUser { get; set; }
    public int ExpiresInSeconds { get; set; } = 300;
    public string? DemoOtp { get; set; }
}

public class PhoneLoginOtpRequest
{
    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [MinLength(4, ErrorMessage = "OTP must be at least 4 digits.")]
    public string Otp { get; set; } = string.Empty;

    public string? FullName { get; set; }
}

public class VerifyPhoneOtpRequest
{
    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Code { get; set; } = string.Empty;
}

public class UserRoleUpdateRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;
}

public class UserAdminDto
{
    public string Id { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public bool IsLockedOut { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public DateTime CreatedAt { get; set; }
}
