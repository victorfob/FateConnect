namespace FateConnect.Api.Modules.Common.Services;

using FateConnect.Api.Modules.Common.Interfaces;
using System;
using System.Threading.Tasks;

public abstract class BaseFileService(IStorageService storageService)
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
                await StorageService.DeleteImageAsync(imageToDropOnFailure);

            throw;
        }
    }
}
