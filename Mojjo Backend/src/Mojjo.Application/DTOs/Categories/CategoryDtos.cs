namespace Mojjo.Application.DTOs.Categories;

public class SubcategoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int ProductCount { get; set; }
}

public class CategoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string? Banner { get; set; }
    public int ProductCount { get; set; }
    public List<SubcategoryDto> Subcategories { get; set; } = new();
}
