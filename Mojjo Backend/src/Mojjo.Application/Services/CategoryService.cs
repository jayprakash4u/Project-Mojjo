using Microsoft.EntityFrameworkCore;
using Mojjo.Application.DTOs.Categories;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;
    private static readonly TimeSpan CategoriesCacheDuration = TimeSpan.FromHours(1);

    public CategoryService(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync(CancellationToken cancellationToken = default)
    {
        const string cacheKey = "categories:all";

        return await _cacheService.GetOrCreateAsync(
            cacheKey,
            async () =>
            {
                // 1. Single database query for all active categories and nested subcategories (AsNoTracking)
                var categories = await _context.Categories
                    .Include(c => c.Subcategories)
                    .Include(c => c.Products)
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.DisplayOrder)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                // 2. Single-pass GroupBy query to count products per subcategory (Eliminates N+1 queries)
                var subcategoryCounts = await _context.Products
                    .AsNoTracking()
                    .Where(p => p.SubcategoryId != null)
                    .GroupBy(p => p.SubcategoryId!)
                    .Select(g => new { SubcategoryId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.SubcategoryId, x => x.Count, cancellationToken);

                return categories.Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Slug = c.Slug,
                    Name = c.Name,
                    Description = c.Description,
                    Icon = c.Icon,
                    Banner = c.Banner,
                    ProductCount = c.Products.Count,
                    Subcategories = c.Subcategories.OrderBy(s => s.DisplayOrder).Select(s => new SubcategoryDto
                    {
                        Id = s.Id,
                        Slug = s.Slug,
                        Name = s.Name,
                        ProductCount = subcategoryCounts.TryGetValue(s.Id, out var count) ? count : 0
                    }).ToList()
                }).ToList();
            },
            CategoriesCacheDuration,
            cancellationToken);
    }

    public async Task<CategoryDto?> GetCategoryBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"categories:slug:{slug.ToLower()}";

        return await _cacheService.GetOrCreateAsync(
            cacheKey,
            async () =>
            {
                var category = await _context.Categories
                    .Include(c => c.Subcategories)
                    .Include(c => c.Products)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Slug.ToLower() == slug.ToLower() && c.IsActive, cancellationToken);

                if (category == null) return null!;

                var subcategoryIds = category.Subcategories.Select(s => s.Id).ToList();
                var subcategoryCounts = await _context.Products
                    .AsNoTracking()
                    .Where(p => p.SubcategoryId != null && subcategoryIds.Contains(p.SubcategoryId))
                    .GroupBy(p => p.SubcategoryId!)
                    .Select(g => new { SubcategoryId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.SubcategoryId, x => x.Count, cancellationToken);

                return new CategoryDto
                {
                    Id = category.Id,
                    Slug = category.Slug,
                    Name = category.Name,
                    Description = category.Description,
                    Icon = category.Icon,
                    Banner = category.Banner,
                    ProductCount = category.Products.Count,
                    Subcategories = category.Subcategories.OrderBy(s => s.DisplayOrder).Select(s => new SubcategoryDto
                    {
                        Id = s.Id,
                        Slug = s.Slug,
                        Name = s.Name,
                        ProductCount = subcategoryCounts.TryGetValue(s.Id, out var count) ? count : 0
                    }).ToList()
                };
            },
            CategoriesCacheDuration,
            cancellationToken);
    }
}
