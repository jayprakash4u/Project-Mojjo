using Microsoft.EntityFrameworkCore;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Products;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Entities;
using Mojjo.Domain.Enums;

namespace Mojjo.Application.Services;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    private static readonly TimeSpan ProductDetailsCacheDuration = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan CuratedListCacheDuration = TimeSpan.FromMinutes(15);

    public ProductService(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterParams filter, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .Include(p => p.Details)
            .AsNoTracking()
            .AsQueryable();

        // Filter by category slug
        if (!string.IsNullOrWhiteSpace(filter.Category))
        {
            var catSlug = filter.Category.ToLower();
            query = query.Where(p => p.Category != null && p.Category.Slug.ToLower() == catSlug);
        }

        // Filter by subcategory slug
        if (!string.IsNullOrWhiteSpace(filter.Subcategory))
        {
            var subcatSlug = filter.Subcategory.ToLower();
            query = query.Where(p => p.Subcategory != null && p.Subcategory.Slug.ToLower() == subcatSlug);
        }

        // Search by title or description
        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var q = filter.Query.ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(q) || p.Description.ToLower().Contains(q));
        }

        // Filter by badge (sale, bestseller, new)
        if (!string.IsNullOrWhiteSpace(filter.Badge))
        {
            if (Enum.TryParse<ProductBadge>(filter.Badge, true, out var badgeEnum))
            {
                query = query.Where(p => p.Badge == badgeEnum);
            }
        }

        // Filter by price range
        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);

        // Filter by in-stock only
        if (filter.InStockOnly == true)
            query = query.Where(p => (p.PhysicalStock - p.ReservedStock - p.SoldStock) > 0);

        // Sorting
        query = filter.Sort?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "rating" => query.OrderByDescending(p => p.Rating),
            "popular" => query.OrderByDescending(p => p.ReviewCount),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.Rating)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var pageNumber = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);

        var products = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = products.Select(MapToDto).ToList();

        return new PagedResult<ProductDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ProductDto?> GetProductBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"products:slug:{slug.ToLower()}";

        return await _cacheService.GetOrCreateAsync(
            cacheKey,
            async () =>
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Subcategory)
                    .Include(p => p.Details)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower(), cancellationToken);

                return product == null ? null! : MapToDto(product);
            },
            ProductDetailsCacheDuration,
            cancellationToken);
    }

    public async Task<ProductDto?> GetProductByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"products:id:{id}";

        return await _cacheService.GetOrCreateAsync(
            cacheKey,
            async () =>
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Subcategory)
                    .Include(p => p.Details)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

                return product == null ? null! : MapToDto(product);
            },
            ProductDetailsCacheDuration,
            cancellationToken);
    }

    public async Task<List<ProductDto>> GetDealsAsync(int count = 6, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"products:deals:{count}";

        return await _cacheService.GetOrCreateAsync(
            cacheKey,
            async () =>
            {
                var products = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Subcategory)
                    .Include(p => p.Details)
                    .AsNoTracking()
                    .Where(p => p.OriginalPrice != null && p.OriginalPrice > p.Price)
                    .OrderByDescending(p => (p.OriginalPrice - p.Price) / p.OriginalPrice)
                    .Take(count)
                    .ToListAsync(cancellationToken);

                return products.Select(MapToDto).ToList();
            },
            CuratedListCacheDuration,
            cancellationToken);
    }

    public async Task<List<ProductDto>> GetBestsellersAsync(int count = 6, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"products:bestsellers:{count}";

        return await _cacheService.GetOrCreateAsync(
            cacheKey,
            async () =>
            {
                var products = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Subcategory)
                    .Include(p => p.Details)
                    .AsNoTracking()
                    .Where(p => p.Badge == ProductBadge.Bestseller || p.ReviewCount > 20)
                    .OrderByDescending(p => p.ReviewCount)
                    .Take(count)
                    .ToListAsync(cancellationToken);

                return products.Select(MapToDto).ToList();
            },
            CuratedListCacheDuration,
            cancellationToken);
    }

    public async Task<List<ProductDto>> GetRelatedProductsAsync(string productId, int count = 4, CancellationToken cancellationToken = default)
    {
        var current = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        if (current == null) return new List<ProductDto>();

        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .Include(p => p.Details)
            .AsNoTracking()
            .Where(p => p.Id != productId && (p.CategoryId == current.CategoryId || p.SubcategoryId == current.SubcategoryId))
            .OrderByDescending(p => p.Rating)
            .Take(count)
            .Select(p => MapToDto(p))
            .ToListAsync(cancellationToken);
    }

    public static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Slug = p.Slug,
        Title = p.Title,
        Category = p.Category?.Slug ?? p.CategoryId,
        Subcategory = p.Subcategory?.Slug ?? p.SubcategoryId,
        Price = p.Price,
        OriginalPrice = p.OriginalPrice,
        Image = p.Image,
        Rating = p.Rating,
        ReviewCount = p.ReviewCount,
        Badge = p.Badge?.ToString().ToLower(),
        Description = p.Description,
        Volume = p.Volume,
        Origin = p.Origin,
        RewardCoins = p.RewardCoins,
        InStock = p.InStock,
        AvailableStock = p.AvailableStock,
        IsLowStock = p.IsLowStock,
        IsOutOfStock = p.IsOutOfStock,
        AgeRestricted = p.AgeRestricted,
        Details = p.Details.Select(d => new ProductDetailDto { Label = d.Label, Value = d.Value }).ToList()
    };
}
