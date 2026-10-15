namespace FateConnect.Api.Modules.Storage.Services;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Storage.Enums;
using FateConnect.Api.Modules.Storage.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

public abstract partial class BaseFileService(IStorageService storageService, ILogger logger)
{
    protected IStorageService StorageService { get; } = storageService;

    protected async Task<string?> StoreImageAsync(
        IFormFile? image,
        EnumStorageContainer container,
        Action<string> attach)
    {
        if (image is null)
            return null;

        string storedImageUrl = await StorageService.UploadImageAsync(image, container);
        attach(storedImageUrl);

        return storedImageUrl;
    }

    protected async Task SaveImageChangeAsync(
        Func<Task> persist,
        string? storedImageUrl,
        string? discardedImageUrl = null)
    {
        await PersistOrDropImageAsync(persist, storedImageUrl);

        if (!string.IsNullOrWhiteSpace(discardedImageUrl))
            await StorageService.DeleteImageAsync(discardedImageUrl);
    }

    private async Task PersistOrDropImageAsync(Func<Task> persist, string? imageToDropOnFailure)
    {
        try
        {
            await persist();
        }
        catch
        {
            if (!string.IsNullOrWhiteSpace(imageToDropOnFailure))
            {
                LogImageDroppedAfterFailedSave(logger, imageToDropOnFailure);
                await StorageService.DeleteImageAsync(imageToDropOnFailure);
            }

            throw;
        }
    }
}
