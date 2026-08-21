using Mojjo.Domain.Common;

namespace Mojjo.Domain.Entities;

public class RewardCoinTransaction : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public int Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Type { get; set; } = "earned"; // earned, spent, expired
    public string? ReferenceOrderId { get; set; }
}
