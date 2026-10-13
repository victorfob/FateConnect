namespace FateConnect.Api.Modules.Storage.Interfaces;

using Microsoft.AspNetCore.Http;
using FateConnect.Api.Modules.Storage.Enums;

public interface IStorageService
{
    Task<string> UploadImageAsync(IFormFile file, EnumStorageContainer container);
    Task DeleteImageAsync(string filePath);
}
