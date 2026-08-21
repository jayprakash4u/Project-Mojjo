using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mojjo.Domain.Entities;

namespace Mojjo.Infrastructure.Persistence.Configurations;

public class StockReservationConfiguration : IEntityTypeConfiguration<StockReservation>
{
    public void Configure(EntityTypeBuilder<StockReservation> builder)
    {
        builder.HasKey(r => r.Id);
        builder.HasIndex(r => new { r.OrderId, r.ProductId });
        builder.HasIndex(r => new { r.Status, r.ExpiresAt });
        builder.HasIndex(r => r.ExpiresAt);

        builder.HasOne(r => r.Order)
            .WithMany()
            .HasForeignKey(r => r.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Product)
            .WithMany(p => p.StockReservations)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class StockAdjustmentLogConfiguration : IEntityTypeConfiguration<StockAdjustmentLog>
{
    public void Configure(EntityTypeBuilder<StockAdjustmentLog> builder)
    {
        builder.HasKey(a => a.Id);
        builder.HasIndex(a => a.ProductId);
        builder.HasIndex(a => a.CreatedAt);

        builder.HasOne(a => a.Product)
            .WithMany(p => p.StockAdjustments)
            .HasForeignKey(a => a.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
