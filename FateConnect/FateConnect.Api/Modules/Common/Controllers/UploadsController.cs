namespace FateConnect.Api.Modules.Common.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;

[ApiController]
[Route(UploadsLocation.FolderName)]
[Authorize]
public class UploadsController(IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("denunciation/{fileName}")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public ActionResult GetDenunciationImage(string fileName)
    {
        return ServeFile(EnumStorageContainer.Denunciation, fileName);
    }

    [HttpGet("{container}/{fileName}")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public ActionResult GetGenericImage(string container, string fileName)
    {
        bool isValidContainer = Enum.TryParse(container, ignoreCase: true, out EnumStorageContainer storageContainer) && Enum.IsDefined(storageContainer);

        if (isValidContainer)
            return NotFound();

        if (storageContainer == EnumStorageContainer.Denunciation)
            return Forbid();

        return ServeFile(storageContainer, fileName);
    }

    private ActionResult ServeFile(EnumStorageContainer storageContainer, string fileName)
    {
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
