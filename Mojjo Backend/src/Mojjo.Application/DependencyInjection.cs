using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Application.Services;

namespace Mojjo.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Business Services
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IRewardService, RewardService>();
        services.AddScoped<IDeliveryService, DeliveryService>();

        // FluentValidation Validators
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
