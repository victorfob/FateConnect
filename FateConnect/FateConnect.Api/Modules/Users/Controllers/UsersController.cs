namespace FateConnect.Api.Modules.Users.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("[controller]")]
[Authorize]
[ApiConventionType(typeof(DefaultApiConventions))]
public class UsersController(IUserService service) : ControllerBase
{
    [HttpPost("signup")]
    [AllowAnonymous]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TokenResponseDto>> SignUpAsync([FromBody] CreateUserDto dto)
    {
        var result = await service.SignUpAsync(dto, HttpContext.GetRequestOrigin());

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpGet("me")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult<ReadUserDto>> GetProfileAsync()
    {
        var result = await service.GetProfileAsync(User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("me")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [ProducesResponseType(typeof(ReadUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ReadUserDto>> UpdateProfileAsync([FromForm] UpdateUserDto dto)
    {
        var result = await service.UpdateProfileAsync(User.GetUserId(), dto);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("me/preferences")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult<ReadUserPreferencesDto>> GetPreferencesAsync()
    {
        var result = await service.GetPreferencesAsync(User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("me/preferences")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> UpdatePreferencesAsync([FromBody] UpdatePreferencesDto dto)
    {
        await service.UpdatePreferencesAsync(User.GetUserId(), dto);

        return NoContent();
    }

    [HttpPatch("me/password")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TokenResponseDto>> ChangePasswordAsync([FromBody] ChangePasswordDto dto)
    {
        var tokenResponse = await service.ChangePasswordAsync(User.GetUserId(), dto);

        if (tokenResponse is null)
            return NotFound();

        return Ok(tokenResponse);
    }

    [HttpDelete("me/image")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> RemoveProfileImageAsync()
    {
        await service.RemoveProfileImageAsync(User.GetUserId());

        return NoContent();
    }

    [HttpPost("me/deactivate")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> DeactivateAccountAsync()
    {
        await service.DeactivateAccountAsync(User.GetUserId());

        return NoContent();
    }

    [HttpGet]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<PagedResultDto<ReadUserSummaryDto>>> GetAllUsersAsync([FromQuery] UserFilterDto filter)
    {
        var result = await service.GetAllUsersAsync(filter);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<ReadUserDto>> GetUserByIdAsync(int id)
    {
        var result = await service.GetUserByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [ProducesResponseType(typeof(ReadUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ReadUserDto>> UpdateUserByAdminAsync(int id, [FromBody] AdminUpdateUserDto dto)
    {
        var result = await service.UpdateUserByAdminAsync(id, dto);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}/profile")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<ReadUserDto>> ChangeUserProfileAsync(int id, [FromBody] ChangeUserProfileDto dto)
    {
        var result = await service.ChangeUserProfileAsync(id, dto.ProfileType, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}/status")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<ReadUserDto>> ChangeUserStatusAsync(int id, [FromBody] ChangeUserStatusDto dto)
    {
        var result = await service.ChangeUserStatusAsync(id, dto.Status, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }
}
