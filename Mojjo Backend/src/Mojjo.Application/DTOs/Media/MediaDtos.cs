namespace Mojjo.Application.DTOs.Media;

public class FileUploadResultDto
{
    public string Url { get; set; } = string.Empty;
    public string FileKey { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
}

public class DeleteFileRequest
{
    public string FileUrlOrKey { get; set; } = string.Empty;
}
