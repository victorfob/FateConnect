namespace FateConnect.Api.Modules.Common.Services;

using FateConnect.Api.Modules.Common.Interfaces;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

public partial class StorageService(IWebHostEnvironment env, ILogger<StorageService> logger) : IStorageService
{
    public async Task<string> UploadImageAsync(IFormFile file, EnumStorageContainer container)
    {
        string containerName = container.ToString().ToLowerInvariant();

        string uploadsFolder = Path.Combine(UploadsLocation.PhysicalRootOf(env), containerName);
        string thumbnailsFolder = Path.Combine(uploadsFolder, UploadsLocation.ThumbnailsFolderName);

        string fileExtension = ImageContentTypes.ExtensionFor(file.ContentType);
        string storedPath = $"{UploadsLocation.FolderName}/{containerName}/{Guid.NewGuid()}{fileExtension}";

        Directory.CreateDirectory(thumbnailsFolder);

        await using Stream upload = file.OpenReadStream();

        await ImageVariants.WriteAsync(
            upload,
            file.ContentType,
            PhysicalPathOf(storedPath),
            PhysicalPathOf(UploadsLocation.ThumbnailOf(storedPath)));

        return storedPath;
    }

    public Task DeleteImageAsync(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
            return Task.CompletedTask;

        string relativePath = filePath.TrimStart('/');

        DeleteStoredFile(filePath, relativePath);
        DeleteStoredFile(filePath, UploadsLocation.ThumbnailOf(relativePath));

        return Task.CompletedTask;
    }

    private void DeleteStoredFile(string requestedPath, string relativePath)
    {
        string physicalFilePath = PhysicalPathOf(relativePath);

        try
        {
            if (File.Exists(physicalFilePath))
                File.Delete(physicalFilePath);
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            LogImageDeletionFailed(logger, requestedPath, exception);
        }
    }

    private string PhysicalPathOf(string relativePath) =>
        Path.Combine(UploadsLocation.WebRootOf(env), relativePath.Replace('/', Path.DirectorySeparatorChar));
}
