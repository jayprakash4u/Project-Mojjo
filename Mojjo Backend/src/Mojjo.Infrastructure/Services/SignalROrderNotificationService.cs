using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Mojjo.Application.DTOs.Orders;
using Mojjo.Application.Interfaces.Hubs;
using Mojjo.Infrastructure.Hubs;

namespace Mojjo.Infrastructure.Services;

public class SignalROrderNotificationService : IOrderNotificationService
{
    private readonly IHubContext<OrderTrackingHub, IOrderTrackingHubClient> _hubContext;
    private readonly ILogger<SignalROrderNotificationService> _logger;

    public SignalROrderNotificationService(
        IHubContext<OrderTrackingHub, IOrderTrackingHubClient> hubContext,
        ILogger<SignalROrderNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyOrderStatusChangedAsync(OrderTrackingUpdateDto update, CancellationToken cancellationToken = default)
    {
        if (update == null || string.IsNullOrWhiteSpace(update.OrderId)) return;

        var groupName = $"order_{update.OrderId}";
        _logger.LogInformation("Broadcasting order status update: Order {OrderId} -> Status: {Status}", update.OrderId, update.Status);

        await _hubContext.Clients.Group(groupName).OrderStatusChanged(update);
    }

    public async Task NotifyDriverLocationUpdatedAsync(DriverLocationUpdateDto location, CancellationToken cancellationToken = default)
    {
        if (location == null || string.IsNullOrWhiteSpace(location.OrderId)) return;

        var groupName = $"order_{location.OrderId}";
        await _hubContext.Clients.Group(groupName).DriverLocationUpdated(location);
    }
}
