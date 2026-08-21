using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Categories;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[EnableRateLimiting("general-api")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Get all active categories with nested subcategories (Public).
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAllCategories(CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetAllCategoriesAsync(cancellationToken);
        return Ok(ApiResponse<List<CategoryDto>>.Ok(categories));
    }

    /// <summary>
    /// Get single category details by slug (Public).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryBySlug(string slug, CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetCategoryBySlugAsync(slug, cancellationToken);
        if (category == null)
        {
            throw new Application.Common.Exceptions.NotFoundException("Category", slug);
        }

        return Ok(ApiResponse<CategoryDto>.Ok(category));
    }
}
