using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Audit;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Entities;
using Mojjo.Infrastructure.Persistence;

namespace Mojjo.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly MojjoDbContext _context;
    private readonly ILogger<AuditService> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = false
    };

    public AuditService(MojjoDbContext context, ILogger<AuditService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogAsync(AuditLogEntryDto entry, CancellationToken cancellationToken = default)
    {
        if (entry == null) return;

        try
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = entry.UserId,
                UserEmail = entry.UserEmail,
                UserRole = entry.UserRole,
                Action = entry.Action,
                ResourceType = entry.ResourceType,
                ResourceId = entry.ResourceId,
                OldValues = entry.OldValues != null ? JsonSerializer.Serialize(entry.OldValues, JsonOptions) : null,
                NewValues = entry.NewValues != null ? JsonSerializer.Serialize(entry.NewValues, JsonOptions) : null,
                IpAddress = entry.IpAddress,
                UserAgent = entry.UserAgent,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "[AUDIT LOGGED] Action: {Action} by User: {UserEmail} ({UserRole}) on Resource: {ResourceType}/{ResourceId}",
                auditLog.Action, auditLog.UserEmail, auditLog.UserRole, auditLog.ResourceType, auditLog.ResourceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record audit log for action: {Action} on resource {Resource}", entry.Action, entry.ResourceId);
        }
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogFilterParams filter, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);

        var query = _context.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.ResourceType))
        {
            query = query.Where(a => a.ResourceType == filter.ResourceType);
        }

        if (!string.IsNullOrWhiteSpace(filter.ResourceId))
        {
            query = query.Where(a => a.ResourceId == filter.ResourceId);
        }

        if (!string.IsNullOrWhiteSpace(filter.Action))
        {
            query = query.Where(a => a.Action == filter.Action);
        }

        if (!string.IsNullOrWhiteSpace(filter.UserId))
        {
            query = query.Where(a => a.UserId == filter.UserId);
        }

        if (filter.FromDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= filter.ToDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserEmail = a.UserEmail,
                UserRole = a.UserRole,
                Action = a.Action,
                ResourceType = a.ResourceType,
                ResourceId = a.ResourceId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                IpAddress = a.IpAddress,
                UserAgent = a.UserAgent,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return PagedResult<AuditLogDto>.Create(items, totalCount, page, pageSize);
    }
}
