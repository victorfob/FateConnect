namespace FateConnect.Api.Modules.Common.Utils;

using Microsoft.AspNetCore.Hosting;

public static class UploadsLocation
{
    public const string FolderName = "uploads";

    public static string RequestPath => $"/{FolderName}";

    private const string WebRootFolderName = "wwwroot";

    public static string WebRootOf(IWebHostEnvironment environment) =>
        environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, WebRootFolderName);

    public static string PhysicalRootOf(IWebHostEnvironment environment) =>
        Path.Combine(WebRootOf(environment), FolderName);
}
