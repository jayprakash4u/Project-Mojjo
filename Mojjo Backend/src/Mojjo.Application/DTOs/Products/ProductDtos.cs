namespace Mojjo.Application.DTOs.Products;

public class ProductDetailDto
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class ProductDto
{
    public string Id { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string Image { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public string? Badge { get; set; }
    public string? Description { get; set; }
    public string? Volume { get; set; }
    public string? Origin { get; set; }
    public List<ProductDetailDto> Details { get; set; } = new();
    public int RewardCoins { get; set; }
    public bool InStock { get; set; }
    public int AvailableStock { get; set; }
    public bool IsLowStock { get; set; }
    public bool IsOutOfStock { get; set; }
    public bool AgeRestricted { get; set; }
}

public class ProductFilterParams
{
    public string? Category { get; set; }
    public string? Subcategory { get; set; }
    public string? Query { get; set; }
    public string? Sort { get; set; } // price_asc, price_desc, rating, newest, popular
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Badge { get; set; }
    public bool? InStockOnly { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
