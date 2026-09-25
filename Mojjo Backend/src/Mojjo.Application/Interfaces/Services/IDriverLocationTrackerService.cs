using Mojjo.Application.DTOs.Orders;

namespace Mojjo.Application.Interfaces.Services;

public interface IDriverLocationTrackerService
{
    /// <summary>
    /// Stores or updates the latest real-time GPS location snapshot for an order.
    /// </summary>
    void UpdateDriverLocation(DriverLocationUpdateDto location);

    /// <summary>
    /// Retrieves the most recent GPS location snapshot for an order.
    /// </summary>
    DriverLocationUpdateDto? GetDriverLocation(string orderId);

    /// <summary>
    /// Clears the location tracking history for a completed or cancelled order.
    /// </summary>
    void RemoveTracking(string orderId);
}
