using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Auth;
using Mojjo.Application.DTOs.Users;
using Mojjo.Application.Interfaces.Identity;
using Mojjo.Domain.Entities;
using Mojjo.Infrastructure.Persistence;

namespace Mojjo.Infrastructure.Identity;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly MojjoDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public TokenService(IConfiguration configuration, MojjoDbContext context, UserManager<ApplicationUser> userManager)
    {
        _configuration = configuration;
        _context = context;
        _userManager = userManager;
    }

    public async Task<AuthResultDto> GenerateTokensAsync(ApplicationUser user, IList<string> roles)
    {
        var jwtSecret = _configuration["JwtSettings:Secret"] ?? "MojjoSuperSecretLongSecurityKeyForJwtTokens2026!@#$%^";
        var issuer = _configuration["JwtSettings:Issuer"] ?? "Mojjo.Api";
        var audience = _configuration["JwtSettings:Audience"] ?? "Mojjo.Client";
        var expiryMinutes = int.TryParse(_configuration["JwtSettings:ExpiryMinutes"], out var mins) ? mins : 15;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var jwtId = Guid.NewGuid().ToString();

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.MobilePhone, user.PhoneNumber ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, jwtId),
            new("fullName", user.FullName ?? string.Empty)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var accessToken = tokenHandler.WriteToken(token);

        // Generate Refresh Token
        var refreshTokenString = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenString,
            JwtId = jwtId,
            IsUsed = false,
            IsRevoked = false,
            ExpiryDate = DateTime.UtcNow.AddDays(7)
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResultDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenString,
            AccessTokenExpiresAt = expiresAt,
            User = new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                Phone = user.PhoneNumber ?? string.Empty,
                AvatarUrl = user.AvatarUrl,
                RewardCoinBalance = user.RewardCoinBalance,
                Roles = roles.ToList(),
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled
            }
        };
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var jwtSecret = _configuration["JwtSettings:Secret"] ?? "MojjoSuperSecretLongSecurityKeyForJwtTokens2026!@#$%^";
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateLifetime = false // Here we want to extract principal even if expired
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public async Task<ApiResponse<AuthResultDto>> RotateRefreshTokenAsync(string accessToken, string refreshToken, CancellationToken cancellationToken = default)
    {
        var principal = GetPrincipalFromExpiredToken(accessToken);
        if (principal == null)
        {
            return ApiResponse<AuthResultDto>.Fail("Invalid access token.");
        }

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var jti = principal.FindFirstValue(JwtRegisteredClaimNames.Jti);

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(jti))
        {
            return ApiResponse<AuthResultDto>.Fail("Invalid token claims.");
        }

        var storedToken = await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken, cancellationToken);

        if (storedToken == null)
        {
            return ApiResponse<AuthResultDto>.Fail("Refresh token does not exist.");
        }

        if (storedToken.IsUsed)
        {
            // Possible token reuse attack! Revoke all tokens for this user
            var allUserTokens = await _context.RefreshTokens.Where(r => r.UserId == storedToken.UserId).ToListAsync(cancellationToken);
            foreach (var t in allUserTokens)
            {
                t.IsRevoked = true;
            }
            await _context.SaveChangesAsync(cancellationToken);

            return ApiResponse<AuthResultDto>.Fail("Refresh token was already used. Session compromised. Please log in again.");
        }

        if (storedToken.IsRevoked)
        {
            return ApiResponse<AuthResultDto>.Fail("Refresh token has been revoked.");
        }

        if (storedToken.ExpiryDate < DateTime.UtcNow)
        {
            return ApiResponse<AuthResultDto>.Fail("Refresh token has expired. Please log in again.");
        }

        if (storedToken.JwtId != jti)
        {
            return ApiResponse<AuthResultDto>.Fail("Refresh token does not match access token.");
        }

        // Mark current refresh token as used
        storedToken.IsUsed = true;
        await _context.SaveChangesAsync(cancellationToken);

        // Generate new token pair
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return ApiResponse<AuthResultDto>.Fail("User not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var authResult = await GenerateTokensAsync(user, roles);

        return ApiResponse<AuthResultDto>.Ok(authResult, "Token refreshed successfully.");
    }

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken, cancellationToken);
        if (token == null || token.IsRevoked) return false;

        token.IsRevoked = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
