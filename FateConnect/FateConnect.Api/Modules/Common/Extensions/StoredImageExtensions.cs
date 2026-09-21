namespace FateConnect.Api.Modules.Common.Extensions;

using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System.IO;

public static class StoredImageExtensions
{
    public static ActionResult ServeStoredImage(
        this ControllerBase controller,
        IWebHostEnvironment environment,
        EnumStorageContainer container,
        string fileName)
    {
        if (!ImageContentTypes.TryDescribeStoredFile(fileName, out string? storedFileName, out string? contentType))
            return controller.NotFound();

        string physicalFilePath = Path.Combine(
            UploadsLocation.PhysicalRootOf(environment),
            container.ToString().ToLowerInvariant(),
            storedFileName);

        if (!File.Exists(physicalFilePath))
            return controller.NotFound();

        controller.Response.Headers.XContentTypeOptions = "nosniff";

        return controller.PhysicalFile(physicalFilePath, contentType);
    }
}
