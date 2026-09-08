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

        string fileExtension = ImageContentTypes.ExtensionFor(file.ContentType);
        string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

        Directory.CreateDirectory(uploadsFolder);

        string physicalFilePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(physicalFilePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"{UploadsLocation.FolderName}/{containerName}/{uniqueFileName}";
    }

    public Task DeleteImageAsync(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
            return Task.CompletedTask;

        string relativePath = filePath.TrimStart('/');

        string physicalFilePath = Path.Combine(
            UploadsLocation.WebRootOf(env),
            relativePath.Replace('/', Path.DirectorySeparatorChar));

        try
        {
            if (File.Exists(physicalFilePath))
                File.Delete(physicalFilePath);
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            LogImageDeletionFailed(logger, filePath, exception);
        }

        return Task.CompletedTask;
    }
}
