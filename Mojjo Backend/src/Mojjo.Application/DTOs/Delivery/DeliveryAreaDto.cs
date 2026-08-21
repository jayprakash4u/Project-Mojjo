namespace Mojjo.Application.DTOs.Delivery;

public class DeliveryAreaDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public int StandardEtaMinutes { get; set; }
    public int ExpressEtaMinutes { get; set; }
    public bool IsExpressAvailable { get; set; }
}
