using Mojjo.Application.DTOs.Orders;

namespace Mojjo.Application.Interfaces.Hubs;

public interface IOrderNotificationService
{
    Task NotifyOrderStatusChangedAsync(OrderTrackingUpdateDto update, CancellationToken cancellationToken = default);
    Task NotifyDriverLocationUpdatedAsync(DriverLocationUpdateDto location, CancellationToken cancellationToken = default);
}
