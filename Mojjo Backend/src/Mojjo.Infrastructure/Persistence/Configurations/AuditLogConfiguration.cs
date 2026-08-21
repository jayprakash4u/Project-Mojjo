using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mojjo.Domain.Entities;

namespace Mojjo.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.UserId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(a => a.UserEmail)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(a => a.UserRole)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(a => a.ResourceType)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(a => a.ResourceId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(a => a.IpAddress)
            .HasMaxLength(64);

        builder.Property(a => a.UserAgent)
            .HasMaxLength(512);

        builder.Property(a => a.OldValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.NewValues)
            .HasColumnType("nvarchar(max)");

        // Indexes for high-speed audit search & compliance reporting
        builder.HasIndex(a => new { a.ResourceType, a.ResourceId })
            .HasDatabaseName("IX_AuditLogs_ResourceType_ResourceId");

        builder.HasIndex(a => a.UserId)
            .HasDatabaseName("IX_AuditLogs_UserId");

        builder.HasIndex(a => a.Action)
            .HasDatabaseName("IX_AuditLogs_Action");

        builder.HasIndex(a => a.CreatedAt)
            .HasDatabaseName("IX_AuditLogs_CreatedAt");
    }
}
