namespace FateConnect.Api.Modules.Common.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;

[ApiController]
[Route(UploadsLocation.FolderName)]
[Authorize]
public class UploadsController(IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("{container}/{fileName}")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public ActionResult GetGenericImage(string container, string fileName)
    {
        bool isValidContainer = Enum.TryParse(container, ignoreCase: true, out EnumStorageContainer storageContainer) && Enum.IsDefined(storageContainer);

        if (!isValidContainer)
            return NotFound();

        if (storageContainer == EnumStorageContainer.Denunciation)
            return Forbid();

        return this.ServeStoredImage(environment, storageContainer, fileName);
    }
}
