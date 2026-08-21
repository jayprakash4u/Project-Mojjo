using Mojjo.Application.DTOs.Orders;

namespace Mojjo.Application.Interfaces.Hubs;

public interface IOrderTrackingHubClient
{
    Task OrderStatusChanged(OrderTrackingUpdateDto update);
    Task DriverLocationUpdated(DriverLocationUpdateDto location);
    Task OrderTrackingJoined(string orderId, string message);
}
