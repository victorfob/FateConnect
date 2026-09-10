namespace FateConnect.Api.Modules.Common.Controllers;

using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route(UploadsLocation.FolderName)]
[Authorize]
public class UploadsController(IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("{container}/{fileName}")]
    public ActionResult GetStoredImage(string container, string fileName)
    {
        bool isValidContainer = Enum.TryParse(container, ignoreCase: true, out EnumStorageContainer storageContainer) && Enum.IsDefined(storageContainer);

        if (!isValidContainer)
            return NotFound();

        bool isKnownImageFormat = ImageContentTypes.TryDescribeStoredFile(fileName, out string? storedFileName, out string? contentType);

        if (!isKnownImageFormat)
            return NotFound();

        string physicalFilePath = Path.Combine(UploadsLocation.PhysicalRootOf(environment), storageContainer.ToString().ToLowerInvariant(), storedFileName!);

        bool imageExistsOnDisk = System.IO.File.Exists(physicalFilePath);

        if (!imageExistsOnDisk)
            return NotFound();

        Response.Headers.XContentTypeOptions = "nosniff";

        return PhysicalFile(physicalFilePath, contentType!);
    }
}
