using Microsoft.EntityFrameworkCore;
using Mojjo.Application.DTOs.Delivery;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Application.Services;

public class DeliveryService : IDeliveryService
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;
    private static readonly TimeSpan DeliveryAreasCacheDuration = TimeSpan.FromHours(1);

    public DeliveryService(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<List<DeliveryAreaDto>> GetDeliveryAreasAsync(CancellationToken cancellationToken = default)
    {
        const string cacheKey = "delivery:areas:all";

        return await _cacheService.GetOrCreateAsync(
            cacheKey,
            async () =>
            {
                var areas = await _context.DeliveryAreas
                    .Where(a => a.IsActive)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                return areas.Select(a => new DeliveryAreaDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    City = a.City,
                    StandardEtaMinutes = a.StandardEtaMinutes,
                    ExpressEtaMinutes = a.ExpressEtaMinutes,
                    IsExpressAvailable = a.IsExpressAvailable
                }).ToList();
            },
            DeliveryAreasCacheDuration,
            cancellationToken);
    }

    public async Task<DeliveryAreaDto?> CheckAreaAvailabilityAsync(string areaName, CancellationToken cancellationToken = default)
    {
        var term = areaName.Trim().ToLower();
        var area = await _context.DeliveryAreas
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Name.ToLower().Contains(term) && a.IsActive, cancellationToken);

        if (area == null) return null;

        return new DeliveryAreaDto
        {
            Id = area.Id,
            Name = area.Name,
            City = area.City,
            StandardEtaMinutes = area.StandardEtaMinutes,
            ExpressEtaMinutes = area.ExpressEtaMinutes,
            IsExpressAvailable = area.IsExpressAvailable
        };
    }
}
