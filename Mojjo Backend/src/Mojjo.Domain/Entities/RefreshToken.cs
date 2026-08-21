using Mojjo.Domain.Common;

namespace Mojjo.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public string Token { get; set; } = string.Empty;
    public string JwtId { get; set; } = string.Empty;
    public bool IsUsed { get; set; } = false;
    public bool IsRevoked { get; set; } = false;
    public DateTime ExpiryDate { get; set; }

    public bool IsActive => !IsUsed && !IsRevoked && DateTime.UtcNow < ExpiryDate;
}
