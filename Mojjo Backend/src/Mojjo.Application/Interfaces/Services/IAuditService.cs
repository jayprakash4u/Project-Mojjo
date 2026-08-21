using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Audit;

namespace Mojjo.Application.Interfaces.Services;

public interface IAuditService
{
    Task LogAsync(AuditLogEntryDto entry, CancellationToken cancellationToken = default);
    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogFilterParams filter, CancellationToken cancellationToken = default);
}
