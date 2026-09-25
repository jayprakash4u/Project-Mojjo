using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using Mojjo.Application.DTOs.Orders;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Infrastructure.Services;

public class DriverLocationTrackerService : IDriverLocationTrackerService
{
    private readonly ConcurrentDictionary<string, DriverLocationUpdateDto> _locations = new();
    private readonly ILogger<DriverLocationTrackerService> _logger;

    public DriverLocationTrackerService(ILogger<DriverLocationTrackerService> logger)
    {
        _logger = logger;
    }

    public void UpdateDriverLocation(DriverLocationUpdateDto location)
    {
        if (location == null || string.IsNullOrWhiteSpace(location.OrderId)) return;

        location.UpdatedAt = DateTime.UtcNow;
        _locations[location.OrderId] = location;
        
        _logger.LogDebug("Updated in-memory driver location for Order {OrderId} (Lat: {Lat}, Lng: {Lng})",
            location.OrderId, location.Latitude, location.Longitude);
    }

    public DriverLocationUpdateDto? GetDriverLocation(string orderId)
    {
        if (string.IsNullOrWhiteSpace(orderId)) return null;

        return _locations.TryGetValue(orderId, out var loc) ? loc : null;
    }

    public void RemoveTracking(string orderId)
    {
        if (string.IsNullOrWhiteSpace(orderId)) return;

        _locations.TryRemove(orderId, out _);
        _logger.LogInformation("Removed tracking stream cache for Order {OrderId}", orderId);
    }
}
