using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Categories;
using Mojjo.Application.DTOs.Delivery;
using Mojjo.Application.DTOs.Notifications;
using Mojjo.Application.DTOs.Orders;
using Mojjo.Application.DTOs.Products;
using Mojjo.Application.DTOs.Rewards;

namespace Mojjo.Application.Interfaces.Services;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterParams filter, CancellationToken cancellationToken = default);
    Task<ProductDto?> GetProductBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<ProductDto?> GetProductByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<List<ProductDto>> GetDealsAsync(int count = 6, CancellationToken cancellationToken = default);
    Task<List<ProductDto>> GetBestsellersAsync(int count = 6, CancellationToken cancellationToken = default);
    Task<List<ProductDto>> GetRelatedProductsAsync(string productId, int count = 4, CancellationToken cancellationToken = default);
}

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllCategoriesAsync(CancellationToken cancellationToken = default);
    Task<CategoryDto?> GetCategoryBySlugAsync(string slug, CancellationToken cancellationToken = default);
}

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<OrderDto?> GetOrderByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<OrderDto?> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<PagedResult<OrderDto>> GetUserOrdersAsync(string userId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<OrderDto?> UpdateOrderStatusAsync(string orderId, UpdateOrderStatusRequest request, string? operatorUserId = null, string? operatorName = null, string? operatorRole = null, CancellationToken cancellationToken = default);
}

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetNotificationsAsync(string? userId = null, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<bool> MarkAsReadAsync(string notificationId, CancellationToken cancellationToken = default);
    Task<bool> MarkAllAsReadAsync(string? userId = null, CancellationToken cancellationToken = default);
}

public interface IRewardService
{
    Task<RewardsSummaryDto> GetUserRewardsAsync(string userId, CancellationToken cancellationToken = default);
}

public interface IDeliveryService
{
    Task<List<DeliveryAreaDto>> GetDeliveryAreasAsync(CancellationToken cancellationToken = default);
    Task<DeliveryAreaDto?> CheckAreaAvailabilityAsync(string areaName, CancellationToken cancellationToken = default);
}
