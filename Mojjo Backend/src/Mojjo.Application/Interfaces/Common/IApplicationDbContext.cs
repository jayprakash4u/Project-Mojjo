using Microsoft.EntityFrameworkCore;
using Mojjo.Domain.Entities;

namespace Mojjo.Application.Interfaces.Common;

public interface IApplicationDbContext
{
    DbSet<Product> Products { get; }
    DbSet<ProductDetail> ProductDetails { get; }
    DbSet<Category> Categories { get; }
    DbSet<Subcategory> Subcategories { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<OrderStatusHistory> OrderStatusHistories { get; }
    DbSet<StockReservation> StockReservations { get; }
    DbSet<StockAdjustmentLog> StockAdjustmentLogs { get; }
    DbSet<ApplicationUser> Users { get; }
    DbSet<UserAddress> UserAddresses { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<RewardCoinTransaction> RewardCoinTransactions { get; }
    DbSet<DeliveryArea> DeliveryAreas { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<PaymentTransaction> PaymentTransactions { get; }
    DbSet<IdempotencyRecord> IdempotencyRecords { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
