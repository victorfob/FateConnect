namespace FateConnect.Api.Modules.Common.Interfaces;

using FateConnect.Api.Modules.Common.Enums;
using Microsoft.AspNetCore.Http;

public interface IStorageService
{
    Task<string> UploadImageAsync(IFormFile file, EnumStorageContainer container);
    Task DeleteImageAsync(string filePath);
}
