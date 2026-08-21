namespace Mojjo.Application.DTOs.Rewards;

public class RewardCoinTransactionDto
{
    public string Id { get; set; } = string.Empty;
    public int Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? ReferenceOrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RewardsSummaryDto
{
    public int Balance { get; set; }
    public List<RewardCoinTransactionDto> History { get; set; } = new();
}
