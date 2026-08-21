using Mojjo.Domain.Common;

namespace Mojjo.Domain.Entities;

public class ProductDetail : BaseEntity
{
    public string ProductId { get; set; } = string.Empty;
    public Product? Product { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
