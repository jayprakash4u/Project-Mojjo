using Microsoft.EntityFrameworkCore;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Notifications;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Entities;

namespace Mojjo.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;

    public NotificationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<NotificationDto>> GetNotificationsAsync(string? userId = null, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var pageNumber = Math.Max(1, page);
        var size = Math.Clamp(pageSize, 1, 50);

        var query = _context.Notifications.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(userId))
        {
            query = query.Where(n => n.UserId == userId || n.UserId == null);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageNumber - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<NotificationDto>
        {
            Items = items.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                Link = n.Link,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = size
        };
    }

    public async Task<bool> MarkAsReadAsync(string notificationId, CancellationToken cancellationToken = default)
    {
        var item = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId, cancellationToken);
        if (item == null) return false;

        item.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(string? userId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Notifications.Where(n => !n.IsRead);
        if (!string.IsNullOrWhiteSpace(userId))
            query = query.Where(n => n.UserId == userId || n.UserId == null);

        var list = await query.ToListAsync(cancellationToken);
        foreach (var item in list)
        {
            item.IsRead = true;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
