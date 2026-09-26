namespace FateConnect.Api.Modules.Common.Extensions;

using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

public static class StoredImageExtensions
{
    public static ActionResult ServeGenericImage(
        this ControllerBase controller,
        IWebHostEnvironment environment,
        string container,
        string fileName,
        EnumStoredImageVariant variant)
    {
        bool isValidContainer = Enum.TryParse(container, ignoreCase: true, out EnumStorageContainer storageContainer)
            && Enum.IsDefined(storageContainer);

        if (!isValidContainer)
            return controller.NotFound();

        if (storageContainer == EnumStorageContainer.Denunciation)
            return controller.Forbid();

        return controller.ServeStoredImage(environment, storageContainer, fileName, variant);
    }

    public static ActionResult ServeStoredImage(
        this ControllerBase controller,
        IWebHostEnvironment environment,
        EnumStorageContainer container,
        string fileName,
        EnumStoredImageVariant variant = EnumStoredImageVariant.Original)
    {
        string requestedFileName = fileName;

        if (variant == EnumStoredImageVariant.Thumbnail)
            requestedFileName = $"{Path.GetFileNameWithoutExtension(fileName)}{UploadsLocation.ThumbnailExtension}";

        if (!ImageContentTypes.TryDescribeStoredFile(requestedFileName, out string? storedFileName, out string? contentType))
            return controller.NotFound();

        string containerFolder = Path.Combine(
            UploadsLocation.PhysicalRootOf(environment),
            container.ToString().ToLowerInvariant());

        if (variant == EnumStoredImageVariant.Thumbnail)
            containerFolder = Path.Combine(containerFolder, UploadsLocation.ThumbnailsFolderName);

        string physicalFilePath = Path.Combine(containerFolder, storedFileName);

        if (!File.Exists(physicalFilePath))
            return controller.NotFound();

        controller.Response.Headers.XContentTypeOptions = "nosniff";

        return controller.PhysicalFile(physicalFilePath, contentType);
    }
}
