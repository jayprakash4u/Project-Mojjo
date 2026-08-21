namespace Mojjo.Infrastructure.Storage;

public class StorageSettings
{
    public const string SectionName = "StorageSettings";

    public string CdnBaseUrl { get; set; } = "http://localhost:5177";
    public string UploadDirectory { get; set; } = "wwwroot/uploads";
    public int MaxFileSizeMb { get; set; } = 5;
    public string[] AllowedExtensions { get; set; } = { ".webp", ".avif", ".jpg", ".jpeg", ".png" };
    public string[] AllowedMimeTypes { get; set; } = { "image/webp", "image/avif", "image/jpeg", "image/png" };
}
