using Microsoft.EntityFrameworkCore;
using Mojjo.Application.DTOs.Rewards;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Application.Services;

public class RewardService : IRewardService
{
    private readonly IApplicationDbContext _context;

    public RewardService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RewardsSummaryDto> GetUserRewardsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var balance = user?.RewardCoinBalance ?? 0;

        var history = await _context.RewardCoinTransactions
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return new RewardsSummaryDto
        {
            Balance = balance,
            History = history.Select(h => new RewardCoinTransactionDto
            {
                Id = h.Id,
                Amount = h.Amount,
                Reason = h.Reason,
                Type = h.Type,
                ReferenceOrderId = h.ReferenceOrderId,
                CreatedAt = h.CreatedAt
            }).ToList()
        };
    }
}
