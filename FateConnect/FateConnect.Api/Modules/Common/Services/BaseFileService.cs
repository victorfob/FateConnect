namespace FateConnect.Api.Modules.Common.Services;

using FateConnect.Api.Modules.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

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
