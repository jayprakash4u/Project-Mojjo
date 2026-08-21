namespace Mojjo.Application.DTOs.Orders;

public class OrderTrackingUpdateDto
{
    public string OrderId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? EstimatedDeliveryTime { get; set; }
    public string? Note { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class DriverLocationUpdateDto
{
    public string OrderId { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Heading { get; set; }
    public double? SpeedKmH { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
