namespace Mojjo.Domain.Entities;

public class ShippingAddress
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public string City { get; set; } = "Kathmandu";
    public string Area { get; set; } = string.Empty;
    public string? Landmark { get; set; }
}
