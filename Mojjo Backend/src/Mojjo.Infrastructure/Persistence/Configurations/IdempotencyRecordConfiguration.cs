using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mojjo.Domain.Entities;

namespace Mojjo.Infrastructure.Persistence.Configurations;

public class IdempotencyRecordConfiguration : IEntityTypeConfiguration<IdempotencyRecord>
{
    public void Configure(EntityTypeBuilder<IdempotencyRecord> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Key)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(x => x.UserId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(x => x.RequestPath)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.RequestHash)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(x => x.ResponseBody)
            .HasColumnType("nvarchar(max)");

        builder.HasIndex(x => new { x.UserId, x.Key })
            .IsUnique()
            .HasDatabaseName("IX_IdempotencyRecords_UserId_Key");

        builder.HasIndex(x => x.ExpiresAt)
            .HasDatabaseName("IX_IdempotencyRecords_ExpiresAt");
    }
}
