namespace FateConnect.Api.Modules.Storage.Services;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Storage.Interfaces;
using Microsoft.Extensions.Logging;

public abstract partial class BaseFileService(IStorageService storageService, ILogger logger)
{
    protected IStorageService StorageService { get; } = storageService;

    protected async Task PersistOrDropImageAsync(Func<Task> persist, string? imageToDropOnFailure)
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
