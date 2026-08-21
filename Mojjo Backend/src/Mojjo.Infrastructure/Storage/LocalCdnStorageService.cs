using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Mojjo.Application.Common.Exceptions;
using Mojjo.Application.DTOs.Media;
using Mojjo.Application.Interfaces.External;

namespace Mojjo.Infrastructure.Storage;

public class LocalCdnStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly StorageSettings _settings;
    private readonly ILogger<LocalCdnStorageService> _logger;

    public LocalCdnStorageService(
        IWebHostEnvironment environment,
        IOptions<StorageSettings> settings,
        ILogger<LocalCdnStorageService> logger)
    {
        _environment = environment;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<FileUploadResultDto> UploadImageAsync(
        Stream fileStream,
        string originalFileName,
        string contentType,
        string folder = "products",
        CancellationToken cancellationToken = default)
    {
        // 1. Validate MIME Type
        if (!_settings.AllowedMimeTypes.Contains(contentType.ToLowerInvariant()))
        {
            throw new BadRequestException($"Unsupported image type '{contentType}'. Allowed formats: WebP, AVIF, JPEG, PNG.");
        }

        // 2. Validate Extension
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) || !_settings.AllowedExtensions.Contains(extension))
        {
            throw new BadRequestException($"Unsupported file extension '{extension}'.");
        }

        // 3. Sanitize Folder & File Name
        var safeFolder = SanitizePathComponent(folder);
        var baseName = Path.GetFileNameWithoutExtension(originalFileName);
        var safeBaseName = SanitizeFileName(baseName);
        var uniqueFileName = $"{safeBaseName}-{Guid.NewGuid():N[..8]}{extension}";

        // 4. Resolve Target Directory on Disk
        var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsPath = Path.Combine(webRoot, "uploads", safeFolder);

        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        var fullFilePath = Path.Combine(uploadsPath, uniqueFileName);

        // 5. Write stream to object storage / static asset store
        await using (var fileDestStream = new FileStream(fullFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await fileStream.CopyToAsync(fileDestStream, cancellationToken);
        }

        var fileInfo = new FileInfo(fullFilePath);
        var fileKey = $"uploads/{safeFolder}/{uniqueFileName}";
        var cdnUrl = GetCdnUrl(fileKey);

        _logger.LogInformation("Image uploaded successfully: {FileKey} ({Size} bytes)", fileKey, fileInfo.Length);

        return new FileUploadResultDto
        {
            Url = cdnUrl,
            FileKey = fileKey,
            FileName = uniqueFileName,
            ContentType = contentType,
            SizeBytes = fileInfo.Length
        };
    }

    public Task<bool> DeleteImageAsync(string fileUrlOrKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var relativeKey = fileUrlOrKey;
            if (relativeKey.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                relativeKey.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(relativeKey);
                relativeKey = uri.AbsolutePath.TrimStart('/');
            }

            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var fullPath = Path.Combine(webRoot, relativeKey.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("Deleted storage file: {Path}", fullPath);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete storage file: {Key}", fileUrlOrKey);
            return Task.FromResult(false);
        }
    }

    public string GetCdnUrl(string fileKey)
    {
        var cleanKey = fileKey.TrimStart('/');
        var baseUrl = _settings.CdnBaseUrl.TrimEnd('/');
        return $"{baseUrl}/{cleanKey}";
    }

    private static string SanitizePathComponent(string name)
    {
        var clean = Regex.Replace(name.ToLowerInvariant(), @"[^a-z0-9_-]", "");
        return string.IsNullOrWhiteSpace(clean) ? "general" : clean;
    }

    private static string SanitizeFileName(string name)
    {
        var clean = Regex.Replace(name.ToLowerInvariant(), @"[^a-z0-9_-]", "-");
        clean = Regex.Replace(clean, @"-+", "-").Trim('-');
        return string.IsNullOrWhiteSpace(clean) ? "image" : clean;
    }
}
