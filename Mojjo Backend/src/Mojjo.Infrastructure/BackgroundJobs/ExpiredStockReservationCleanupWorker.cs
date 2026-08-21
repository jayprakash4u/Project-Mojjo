using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Infrastructure.BackgroundJobs;

public class ExpiredStockReservationCleanupWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ExpiredStockReservationCleanupWorker> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(2);

    public ExpiredStockReservationCleanupWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<ExpiredStockReservationCleanupWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ExpiredStockReservationCleanupWorker started. Running every {IntervalMinutes} minute(s).", Interval.TotalMinutes);

        using var timer = new PeriodicTimer(Interval);

        // Run once upon startup after a brief 10-second warm-up delay
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            await RunCleanupAsync(stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunCleanupAsync(stoppingToken);
        }

        _logger.LogInformation("ExpiredStockReservationCleanupWorker is stopping.");
    }

    private async Task RunCleanupAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var inventoryService = scope.ServiceProvider.GetRequiredService<IInventoryService>();

            var releasedCount = await inventoryService.ReleaseExpiredReservationsAsync(cancellationToken);
            if (releasedCount > 0)
            {
                _logger.LogInformation("Automatic inventory cleanup completed. Released {Count} expired stock reservation(s).", releasedCount);
            }
        }
        catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogError(ex, "Error occurred during expired stock reservation cleanup execution.");
        }
    }
}
