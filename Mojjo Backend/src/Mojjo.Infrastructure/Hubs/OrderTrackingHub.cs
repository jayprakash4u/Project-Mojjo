using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Mojjo.Application.DTOs.Orders;
using Mojjo.Application.Interfaces.Hubs;

namespace Mojjo.Infrastructure.Hubs;

public class OrderTrackingHub : Hub<IOrderTrackingHubClient>
{
    private readonly ILogger<OrderTrackingHub> _logger;

    public OrderTrackingHub(ILogger<OrderTrackingHub> logger)
    {
        _logger = logger;
    }

    public async Task JoinOrderTracking(string orderId)
    {
        if (string.IsNullOrWhiteSpace(orderId)) return;

        var groupName = $"order_{orderId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        _logger.LogInformation("Connection {ConnectionId} joined tracking group {GroupName}", Context.ConnectionId, groupName);
        await Clients.Caller.OrderTrackingJoined(orderId, $"Successfully connected to live tracking stream for order {orderId}.");
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

        var groupName = $"order_{location.OrderId}";
        location.UpdatedAt = DateTime.UtcNow;

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
