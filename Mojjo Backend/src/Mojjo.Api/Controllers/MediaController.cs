using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Media;
using Mojjo.Application.Interfaces.External;
using Mojjo.Domain.Constants;

namespace Mojjo.Api.Controllers;

public class ImageUploadForm
{
    public required IFormFile File { get; set; }
    public string Folder { get; set; } = "products";
}

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class MediaController : ControllerBase
{
    private readonly IFileStorageService _storageService;
    private const long MaxFileSizeInBytes = 5 * 1024 * 1024; // 5 MB

    public MediaController(IFileStorageService storageService)
    {
        _storageService = storageService;
    }

    /// <summary>
    /// Upload an image to Object Storage / CDN (Returns clean CDN URL for storing in database).
    /// </summary>
    [Authorize]
    [EnableRateLimiting("general-api")]
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxFileSizeInBytes)]
    public async Task<ActionResult<ApiResponse<FileUploadResultDto>>> UploadImage(
        [FromForm] ImageUploadForm form,
        CancellationToken cancellationToken = default)
    {
        var file = form.File;
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.Fail("No file was uploaded."));
        }

        if (file.Length > MaxFileSizeInBytes)
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.Fail("File exceeds the maximum allowed size of 5 MB."));
        }

        await using var stream = file.OpenReadStream();
        var result = await _storageService.UploadImageAsync(
            stream,
            file.FileName,
            file.ContentType,
            form.Folder,
            cancellationToken);

        return Ok(ApiResponse<FileUploadResultDto>.Ok(result, "Image uploaded to Object Storage successfully."));
    }

    /// <summary>
    /// Delete an image from Object Storage / CDN (Admin/Manager only).
    /// </summary>
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [HttpDelete]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteImage(
        [FromBody] DeleteFileRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.FileUrlOrKey))
        {
            return BadRequest(ApiResponse<bool>.Fail("File URL or key is required."));
        }

        var deleted = await _storageService.DeleteImageAsync(request.FileUrlOrKey, cancellationToken);
        if (!deleted)
        {
            return NotFound(ApiResponse<bool>.Fail("File not found or could not be deleted."));
        }

        return Ok(ApiResponse<bool>.Ok(true, "Image deleted successfully from Object Storage."));
    }
}
