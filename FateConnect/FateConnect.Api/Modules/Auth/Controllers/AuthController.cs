using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FateConnect.Api.Modules.Auth.Controllers;

[ApiController]
[Route("[controller]")]
[Produces("application/json")]
[ApiConventionType(typeof(DefaultApiConventions))]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> LoginAsync([FromBody] LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);
        return Ok(response);
    }

    [HttpPost("reactivate")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ReactivateAsync([FromBody] LoginDto dto)
    {
        var response = await _authService.ReactivateAsync(dto);
        return Ok(response);
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LogoutAsync()
    {
        await _authService.LogoutAsync(User.GetUserId());
        return NoContent();
    }

    [HttpGet("session")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetSession()
    {
        return NoContent();
    }

    [HttpPost("confirm-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TokenResponseDto>> ConfirmEmail([FromBody] ConfirmEmailDto dto)
    {
        var tokenResponse = await _authService.ConfirmEmailAsync(dto);
        return Ok(tokenResponse);
    }

    [HttpPost("resend-confirmation-email")]
    [AllowAnonymous]
    public async Task<IActionResult> ResendConfirmationEmail([FromBody] EmailRequestDto dto)
    {
        await _authService.ResendConfirmationEmailAsync(dto);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ForgotPassword([FromBody] EmailRequestDto dto)
    {
        await _authService.ForgotPasswordAsync(dto);
        return NoContent();
    }

    [HttpGet("verify-reset-token")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyResetToken([FromQuery] string token)
    {
        await _authService.VerifyResetTokenAsync(token);
        return NoContent();
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TokenResponseDto>> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var tokenResponse = await _authService.ResetPasswordAsync(dto);
        return Ok(tokenResponse);
    }

    [HttpPost("unlock")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UnlockAccount([FromBody] UnlockAccountDto dto)
    {
        await _authService.UnlockAccountAsync(dto);
        return NoContent();
    }
}
