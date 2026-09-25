using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Mojjo.Application.DTOs.Orders;
using Mojjo.Application.Interfaces.Hubs;

using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Infrastructure.Hubs;

public class OrderTrackingHub : Hub<IOrderTrackingHubClient>
{
    private readonly ILogger<OrderTrackingHub> _logger;
    private readonly IDriverLocationTrackerService _locationTracker;

    public OrderTrackingHub(
        ILogger<OrderTrackingHub> logger,
        IDriverLocationTrackerService locationTracker)
    {
        _logger = logger;
        _locationTracker = locationTracker;
    }

    public async Task JoinOrderTracking(string orderId)
    {
        if (string.IsNullOrWhiteSpace(orderId)) return;

        var groupName = $"order_{orderId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        _logger.LogInformation("Connection {ConnectionId} joined tracking group {GroupName}", Context.ConnectionId, groupName);
        await Clients.Caller.OrderTrackingJoined(orderId, $"Successfully connected to live tracking stream for order {orderId}.");

        // Immediately push latest cached driver location to caller if available
        var latestLocation = _locationTracker.GetDriverLocation(orderId);
        if (latestLocation != null)
        {
            await Clients.Caller.DriverLocationUpdated(latestLocation);
        }
    }

    public async Task LeaveOrderTracking(string orderId)
    {
        if (string.IsNullOrWhiteSpace(orderId)) return;

        var groupName = $"order_{orderId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        _logger.LogInformation("Connection {ConnectionId} left tracking group {GroupName}", Context.ConnectionId, groupName);
    }

    public async Task SendDriverLocation(DriverLocationUpdateDto location)
    {
        if (location == null || string.IsNullOrWhiteSpace(location.OrderId)) return;

        location.UpdatedAt = DateTime.UtcNow;
        _locationTracker.UpdateDriverLocation(location);

        var groupName = $"order_{location.OrderId}";
        _logger.LogDebug("Broadcasting driver location for order {OrderId} (Lat: {Lat}, Lng: {Lng})", location.OrderId, location.Latitude, location.Longitude);
        await Clients.Group(groupName).DriverLocationUpdated(location);
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected to OrderTrackingHub: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected from OrderTrackingHub: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
