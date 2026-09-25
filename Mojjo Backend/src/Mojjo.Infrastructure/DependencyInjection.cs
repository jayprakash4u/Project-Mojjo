using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.External;
using Mojjo.Application.Interfaces.Identity;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Entities;
using Mojjo.Infrastructure.Caching;
using Mojjo.Infrastructure.Identity;
using Mojjo.Infrastructure.Payments;
using Mojjo.Infrastructure.Persistence;

namespace Mojjo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=(localdb)\\mssqllocaldb;Database=MojjoDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";

        services.AddDbContext<MojjoDbContext>(options =>
            options.UseSqlServer(connectionString, b => 
            {
                b.MigrationsAssembly(typeof(MojjoDbContext).Assembly.FullName);
                b.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                b.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
            }));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<MojjoDbContext>());

        // ASP.NET Core Identity Configuration
        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            // Password settings (Production grade)
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;

            // Lockout settings (Brute force & rate limit protection)
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User settings (Phone-first OTP enabled)
            options.User.RequireUniqueEmail = false;
            options.SignIn.RequireConfirmedPhoneNumber = false;
        })
        .AddEntityFrameworkStores<MojjoDbContext>()
        .AddDefaultTokenProviders();

        // HttpContext and Security Services
        services.AddHttpContextAccessor();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // Payment Gateways & HTTP Clients
        services.AddHttpClient<IEsewaPaymentGateway, EsewaPaymentGateway>();
        services.AddHttpClient<IKhaltiPaymentGateway, KhaltiPaymentGateway>();
        services.AddScoped<IPaymentService, PaymentService>();

        // Inventory Management & Concurrency Service
        services.AddScoped<IInventoryService, Services.InventoryService>();

        // Hybrid L1/L2 Caching (In-Memory L1 + Redis L2 with circuit breaker)
        services.AddMemoryCache();

        var redisConnectionString = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redisConnectionString))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                var redisConfig = StackExchange.Redis.ConfigurationOptions.Parse(redisConnectionString);
                redisConfig.AbortOnConnectFail = false;
                redisConfig.ConnectTimeout = 1000;
                redisConfig.SyncTimeout = 1000;
                redisConfig.AsyncTimeout = 1000;

                options.ConfigurationOptions = redisConfig;
                options.InstanceName = "Mojjo:";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        services.AddSingleton<ICacheService, DistributedCacheService>();

        // Object Storage & CDN File Service
        services.Configure<Storage.StorageSettings>(configuration.GetSection(Storage.StorageSettings.SectionName));
        services.AddScoped<IFileStorageService, Storage.LocalCdnStorageService>();

        // Enterprise Idempotency Service
        services.AddScoped<Application.Interfaces.Infrastructure.IIdempotencyService, Services.DistributedIdempotencyService>();

        // Production Background Workers
        services.AddHostedService<BackgroundJobs.ExpiredStockReservationCleanupWorker>();

        // Real-Time WebSockets & Live Order Tracking
        services.AddSignalR();
        services.AddSingleton<Application.Interfaces.Services.IDriverLocationTrackerService, Services.DriverLocationTrackerService>();
        services.AddScoped<Application.Interfaces.Hubs.IOrderNotificationService, Services.SignalROrderNotificationService>();

        // System-Wide Audit Logging Service
        services.AddScoped<Application.Interfaces.Services.IAuditService, Services.AuditService>();

        // SMS & OTP Service (FakeSmsService for Dev / RealSmsService for Production)
        var useFakeSms = configuration.GetValue<bool>("SmsSettings:UseFakeService", defaultValue: true);
        if (useFakeSms)
        {
            services.AddScoped<ISmsService, Services.FakeSmsService>();
        }
        else
        {
            services.AddHttpClient<ISmsService, Services.RealSmsService>();
        }

        // Email Service (FakeEmailService for Dev / RealEmailService for Production)
        var useFakeEmail = configuration.GetValue<bool>("EmailSettings:UseFakeService", defaultValue: true);
        if (useFakeEmail)
        {
            services.AddScoped<IEmailService, Services.FakeEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, Services.RealEmailService>();
        }

        return services;
    }
}
