namespace FateConnect.Api.Modules.Users.Controllers;

using System.Threading.Tasks;
using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
[SwaggerTag(
    "Accounts: sign-up, the profile and preferences of the signed-in user, and user management by administrators.")]
public class UsersController(IUserService service) : ControllerBase
{
    [HttpPost("signup")]
    [AllowAnonymous]
    [Consumes("application/json")]
    [SwaggerOperation(
        OperationId = "SignUp",
        Summary = "Sign up",
        Description = "Creates an account with the institutional e-mail and sends the confirmation link. The " +
            "account signs in only after the e-mail is confirmed. An e-mail already in use answers " +
            "409 naming the field.")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SignUpAsync([FromBody] CreateUserDto dto)
    {
        await service.SignUpAsync(dto, HttpContext.GetRequestOrigin());

        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpGet("me")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "GetMyProfile",
        Summary = "Get my profile",
        Description = "Returns the profile of the signed-in user.")]
    [ProducesResponseType(typeof(ReadUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadUserDto>> GetProfileAsync()
    {
        var result = await service.GetProfileAsync(User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("me")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "UpdateMyProfile",
        Summary = "Update my profile",
        Description = "Updates the personal data, the contact and the photo of the signed-in user; fields left " +
            "out keep their value. Phone and contact e-mail are saved together, and one already used " +
            "by another account answers 409 naming the field.")]
    [ProducesResponseType(typeof(ReadUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ReadUserDto>> UpdateProfileAsync([FromForm] UpdateUserDto dto)
    {
        var result = await service.UpdateProfileAsync(User.GetUserId(), dto);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("me/preferences")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "GetMyPreferences",
        Summary = "Get my preferences",
        Description = "Returns the notification preferences of the signed-in user.")]
    [ProducesResponseType(typeof(ReadUserPreferencesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadUserPreferencesDto>> GetPreferencesAsync()
    {
        var result = await service.GetPreferencesAsync(User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("me/preferences")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "UpdateMyPreferences",
        Summary = "Update my preferences",
        Description = "Turns the notifications on or off for the signed-in user, in the app and by push; turning " +
            "them off also removes every push device of the account. A field left out keeps its value.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> UpdatePreferencesAsync([FromBody] UpdatePreferencesDto dto)
    {
        await service.UpdatePreferencesAsync(User.GetUserId(), dto);

        return NoContent();
    }

    [HttpPatch("me/password")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "ChangeMyPassword",
        Summary = "Change my password",
        Description = "Changes the password after checking the current one, ends every session of the user and " +
            "returns a new session token.")]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TokenResponseDto>> ChangePasswordAsync([FromBody] ChangePasswordDto dto)
    {
        var tokenResponse = await service.ChangePasswordAsync(User.GetUserId(), dto);

        if (tokenResponse is null)
            return NotFound();

        return Ok(tokenResponse);
    }

    [HttpDelete("me/image")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "RemoveMyProfileImage",
        Summary = "Remove my photo",
        Description = "Removes the profile photo of the signed-in user; without one, nothing changes.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> RemoveProfileImageAsync()
    {
        await service.RemoveProfileImageAsync(User.GetUserId());

        return NoContent();
    }

    [HttpPost("me/deactivate")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "DeactivateMyAccount",
        Summary = "Deactivate my account",
        Description = "Deactivates the account of the signed-in user and ends every session. Signing in through " +
            "the reactivation brings it back.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> DeactivateAccountAsync()
    {
        await service.DeactivateAccountAsync(User.GetUserId());

        return NoContent();
    }

    [HttpGet]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "ListUsers",
        Summary = "List users",
        Description = "Returns a page of users matching the optional filters. Administrators only.")]
    public async Task<ActionResult<PagedResultDto<ReadUserSummaryDto>>> GetAllAsync([FromQuery] UserFilterDto filter)
    {
        var result = await service.GetAllAsync(filter);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "GetUserById",
        Summary = "Get a user by ID",
        Description = "Returns the profile of a user. Administrators only.")]
    [ProducesResponseType(typeof(ReadUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadUserDto>> GetByIdAsync([SwaggerParameter("User ID.")] int id)
    {
        var result = await service.GetByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "UpdateUser",
        Summary = "Update a user",
        Description = "Updates the name, the institutional e-mail and the contact of a user; fields left out " +
            "keep their value. An e-mail or phone already used by another account answers 409 naming " +
            "the field. Administrators only.")]
    [ProducesResponseType(typeof(ReadUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ReadUserDto>> UpdateUserByAdminAsync(
        [SwaggerParameter("User ID.")] int id,
        [FromBody] AdminUpdateUserDto dto)
    {
        var result = await service.UpdateUserByAdminAsync(id, dto, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}/profile")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "ChangeUserProfile",
        Summary = "Change the profile of a user",
        Description = "Promotes a user to administrator or demotes to operator, and records the action. An " +
            "administrator cannot change their own account. Administrators only.")]
    [ProducesResponseType(typeof(ReadUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadUserDto>> ChangeUserProfileAsync(
        [SwaggerParameter("User ID.")] int id,
        [FromBody] ChangeUserProfileDto dto)
    {
        var result = await service.ChangeUserProfileAsync(id, dto.ProfileType, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}/status")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "ChangeUserStatus",
        Summary = "Ban or unban a user",
        Description = "Bans an account or lifts the ban, and records the action. Any other change, or the " +
            "administrator's own account, answers 400. Administrators only.")]
    [ProducesResponseType(typeof(ReadUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadUserDto>> ChangeUserStatusAsync(
        [SwaggerParameter("User ID.")] int id,
        [FromBody] ChangeUserStatusDto dto)
    {
        var result = await service.ChangeUserStatusAsync(id, dto.Status, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }
}
