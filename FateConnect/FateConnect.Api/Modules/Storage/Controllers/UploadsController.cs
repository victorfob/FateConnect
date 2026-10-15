namespace FateConnect.Api.Modules.Storage.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Storage.Enums;
using FateConnect.Api.Modules.Storage.Extensions;
using FateConnect.Api.Modules.Storage.Utils;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route(UploadsLocation.FolderName)]
[Authorize]
[SwaggerTag("Photos of lost and found items and of user profiles. Report photos go through the reports.")]
public class UploadsController(IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("{container}/{fileName}")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "GetUploadedImage",
        Summary = "Get an uploaded photo",
        Description = "Returns a stored photo by its folder and file name. The reports folder answers 403, and an " +
            "unknown folder or file answers 404.")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK, "image/jpeg", "image/png", "image/webp")]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult GetGenericImage(
        [SwaggerParameter("Folder of the photo: `lostandfound` or `user`.")] string container,
        [SwaggerParameter("File name of the photo, as returned in the image address.")] string fileName) =>
        this.ServeGenericImage(environment, container, fileName, EnumStoredImageVariant.Original);

    [HttpGet("{container}/" + UploadsLocation.ThumbnailsFolderName + "/{fileName}")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "GetUploadedThumbnail",
        Summary = "Get the thumbnail of an uploaded photo",
        Description = "Returns the reduced version of a stored photo, under the same rules as the photo.")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK, "image/jpeg", "image/png", "image/webp")]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult GetGenericThumbnail(
        [SwaggerParameter("Folder of the photo: `lostandfound` or `user`.")] string container,
        [SwaggerParameter("File name of the original photo, as returned in the image address.")] string fileName) =>
        this.ServeGenericImage(environment, container, fileName, EnumStoredImageVariant.Thumbnail);
}
