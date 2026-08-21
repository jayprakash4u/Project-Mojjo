using Mojjo.Domain.Common;

namespace Mojjo.Domain.Entities;

public class UserAddress : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public string Label { get; set; } = "Home"; // Home, Work, Other
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Landmark { get; set; }
    public bool IsDefault { get; set; } = false;
}
