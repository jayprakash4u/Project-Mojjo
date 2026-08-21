using Mojjo.Domain.Common;

namespace Mojjo.Domain.Entities;

public class DeliveryArea : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public int StandardEtaMinutes { get; set; } = 30;
    public int ExpressEtaMinutes { get; set; } = 15;
    public bool IsExpressAvailable { get; set; } = true;
    public bool IsActive { get; set; } = true;
}
