using Mojjo.Domain.Common;

namespace Mojjo.Domain.Entities;

public class Subcategory : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;
    public Category? Category { get; set; }
    public int DisplayOrder { get; set; } = 0;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
