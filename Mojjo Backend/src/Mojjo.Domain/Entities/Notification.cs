using Mojjo.Domain.Common;

namespace Mojjo.Domain.Entities;

public class Notification : BaseEntity
{
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "system"; // order, promo, reward, system
    public string? Link { get; set; }
    public bool IsRead { get; set; } = false;
}
