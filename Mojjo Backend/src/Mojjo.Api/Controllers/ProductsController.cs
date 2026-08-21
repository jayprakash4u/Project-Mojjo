using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Products;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Constants;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[EnableRateLimiting("general-api")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// Get paginated and filtered list of products (Public catalog).
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetProducts([FromQuery] ProductFilterParams filter, CancellationToken cancellationToken)
    {
        var result = await _productService.GetProductsAsync(filter, cancellationToken);
        return Ok(ApiResponse<PagedResult<ProductDto>>.Ok(result));
    }

    /// <summary>
    /// Get single product details by slug (Public).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var product = await _productService.GetProductBySlugAsync(slug, cancellationToken);
        if (product == null)
        {
            throw new Application.Common.Exceptions.NotFoundException("Product", slug);
        }

        return Ok(ApiResponse<ProductDto>.Ok(product));
    }

    /// <summary>
    /// Get flash deals and top promotional discounts (Public).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("deals")]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetDeals([FromQuery] int count = 6, CancellationToken cancellationToken = default)
    {
        var deals = await _productService.GetDealsAsync(count, cancellationToken);
        return Ok(ApiResponse<List<ProductDto>>.Ok(deals));
    }

    /// <summary>
    /// Get bestselling items (Public).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("bestsellers")]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetBestsellers([FromQuery] int count = 6, CancellationToken cancellationToken = default)
    {
        var bestsellers = await _productService.GetBestsellersAsync(count, cancellationToken);
        return Ok(ApiResponse<List<ProductDto>>.Ok(bestsellers));
    }

    /// <summary>
    /// Search catalog by keywords with strict rate limiting defense (Public).
    /// </summary>
    [AllowAnonymous]
    [EnableRateLimiting("search-policy")]
    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> Search([FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var filter = new ProductFilterParams
        {
            Query = q,
            Page = page,
            PageSize = pageSize
        };
        var result = await _productService.GetProductsAsync(filter, cancellationToken);
        return Ok(ApiResponse<PagedResult<ProductDto>>.Ok(result));
    }
}
