namespace FateConnect.Api.Modules.Storage.Interfaces;

using FateConnect.Api.Modules.Storage.Enums;
using Microsoft.AspNetCore.Http;

public interface IStorageService
{
    Task<string> UploadImageAsync(IFormFile file, EnumStorageContainer container);
    Task DeleteImageAsync(string filePath);
}
