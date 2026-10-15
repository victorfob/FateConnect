namespace FateConnect.Api.Modules.Users.Controllers;

using System.Collections.Generic;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("Users/me/legal-documents")]
[AuthorizeProfile(EnumProfileType.Operator)]
[SwaggerTag("Legal documents: the current version of the terms of use and of the privacy policy, and their acceptance by the signed-in user.")]
public class LegalDocumentsController(ILegalDocumentService service) : ControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        OperationId = "GetMyLegalDocuments",
        Summary = "Get my legal documents",
        Description = "Returns, for each legal document, its current version and whether the signed-in user " +
            "has accepted it. A document whose current version is not accepted must be accepted before the " +
            "app is used.")]
    [ProducesResponseType(typeof(IReadOnlyList<ReadLegalDocumentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ReadLegalDocumentDto>>> GetStatusAsync()
    {
        var result = await service.GetStatusAsync(User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("acceptances")]
    [Consumes("application/json")]
    [SwaggerOperation(
        OperationId = "AcceptLegalDocuments",
        Summary = "Accept legal documents",
        Description = "Records that the signed-in user accepted each document sent, with the address and the " +
            "browser of the request, as at sign-up. Only the current version of each document is accepted; " +
            "a document already accepted in that version is not recorded again.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> AcceptAsync([FromBody] AcceptDocumentsDto dto)
    {
        bool userExists = await service.AcceptAsync(User.GetUserId(), dto, HttpContext.GetRequestOrigin());

        if (!userExists)
            return NotFound();

        return NoContent();
    }
}
