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
        if (!Enum.TryParse(container, ignoreCase: true, out EnumStorageContainer storageContainer)
            || !Enum.IsDefined(storageContainer))
            return NotFound();

        if (!ImageContentTypes.TryDescribeStoredFile(fileName, out string? storedFileName, out string? contentType))
            return NotFound();

        string physicalFilePath = Path.Combine(
            UploadsLocation.PhysicalRootOf(environment),
            storageContainer.ToString().ToLowerInvariant(),
            storedFileName);

        if (!System.IO.File.Exists(physicalFilePath))
            return NotFound();

        Response.Headers["X-Content-Type-Options"] = "nosniff";

        return PhysicalFile(physicalFilePath, contentType);
    }
}
