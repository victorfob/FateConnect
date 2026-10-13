namespace FateConnect.Api.Modules.Storage.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Storage.Extensions;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using FateConnect.Api.Modules.Storage.Enums;
using FateConnect.Api.Modules.Storage.Utils;

[ApiController]
[Route(UploadsLocation.FolderName)]
[Authorize]
public class UploadsController(IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("{container}/{fileName}")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public ActionResult GetGenericImage(string container, string fileName) =>
        this.ServeGenericImage(environment, container, fileName, EnumStoredImageVariant.Original);

    [HttpGet("{container}/" + UploadsLocation.ThumbnailsFolderName + "/{fileName}")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public ActionResult GetGenericThumbnail(string container, string fileName) =>
        this.ServeGenericImage(environment, container, fileName, EnumStoredImageVariant.Thumbnail);
}
