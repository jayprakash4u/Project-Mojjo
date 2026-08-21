using Mojjo.Application.DTOs.Media;

namespace Mojjo.Application.Interfaces.External;

public interface IFileStorageService
{
    Task<FileUploadResultDto> UploadImageAsync(Stream fileStream, string originalFileName, string contentType, string folder = "products", CancellationToken cancellationToken = default);
    Task<bool> DeleteImageAsync(string fileUrlOrKey, CancellationToken cancellationToken = default);
    string GetCdnUrl(string fileKey);
}
