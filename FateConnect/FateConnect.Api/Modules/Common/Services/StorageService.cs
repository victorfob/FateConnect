namespace FateConnect.Api.Modules.Common.Services;

using System.IO;
using FateConnect.Api.Modules.Common.Interfaces;
using FateConnect.Api.Modules.Common.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

public class StorageService(IWebHostEnvironment env) : IStorageService
{
    private const string WebRootFolderName = "wwwroot";
    private const string UploadsFolderName = "uploads";

    public async Task<string> UploadImageAsync(IFormFile file, EnumStorageContainer container)
    {
        string containerName = container.ToString().ToLowerInvariant();

        string webRootPath = env.WebRootPath ?? Path.Combine(env.ContentRootPath, WebRootFolderName);

        string uploadsFolder = Path.Combine(webRootPath, UploadsFolderName, containerName);

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        string fileExtension = Path.GetExtension(file.FileName);
        string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

        string physicalFilePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(physicalFilePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/{UploadsFolderName}/{containerName}/{uniqueFileName}";
    }

    public Task DeleteImageAsync(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
            return Task.CompletedTask;

        string relativePath = filePath.TrimStart('/');

        string webRootPath = env.WebRootPath ?? Path.Combine(env.ContentRootPath, WebRootFolderName);

        string physicalFilePath = Path.Combine(webRootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

        if (File.Exists(physicalFilePath))
            File.Delete(physicalFilePath);

        return Task.CompletedTask;
    }
}
