namespace FateConnect.Api.Modules.Auth.Controllers;

using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
[SwaggerTag("Sign-in, session, e-mail confirmation, account unlock and password recovery.")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [SwaggerOperation(
        OperationId = "Login",
        Summary = "Sign in",
        Description = "Checks the institutional e-mail and password and returns a session token. Repeated wrong " +
            "passwords lock the account for a while and send an unlock link by e-mail.")]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> LoginAsync([FromBody] LoginDto dto)
    {
        var response = await authService.LoginAsync(dto);
        return Ok(response);
    }

    [HttpPost("reactivate")]
    [AllowAnonymous]
    [SwaggerOperation(
        OperationId = "Reactivate",
        Summary = "Reactivate the account and sign in",
        Description = "Signs in like the login and, when the account was deactivated by its owner, reactivates it " +
            "first.")]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> ReactivateAsync([FromBody] LoginDto dto)
    {
        var response = await authService.ReactivateAsync(dto);
        return Ok(response);
    }

    [HttpPost("logout")]
    [Authorize]
    [SwaggerOperation(
        OperationId = "Logout",
        Summary = "Sign out everywhere",
        Description = "Revokes every session token of the user, on every device, and tells the open tabs that the " +
            "session ended.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> LogoutAsync()
    {
        await authService.LogoutAsync(User.GetUserId());
        return NoContent();
    }

    [HttpGet("session")]
    [Authorize]
    [SwaggerOperation(
        OperationId = "GetSession",
        Summary = "Check the session",
        Description = "Answers 204 while the session token is valid and 401 once it expired or was revoked.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public IActionResult GetSession()
    {
        return NoContent();
    }

    [HttpPost("confirm-email")]
    [AllowAnonymous]
    [SwaggerOperation(
        OperationId = "ConfirmEmail",
        Summary = "Confirm the e-mail",
        Description = "Confirms the institutional e-mail with the token sent at sign-up and returns a session " +
            "token. The token works once and expires.")]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
    {
        var tokenResponse = await authService.ConfirmEmailAsync(dto);
        return Ok(tokenResponse);
    }

    [HttpPost("resend-confirmation-email")]
    [AllowAnonymous]
    [SwaggerOperation(
        OperationId = "ResendConfirmationEmail",
        Summary = "Resend the confirmation e-mail",
        Description = "Sends a new confirmation link and voids the previous ones. Answers 204 even when the e-mail " +
            "has no account, is already confirmed or asked again too soon, and then sends nothing.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResendConfirmationEmail([FromBody] EmailRequestDto dto)
    {
        await authService.ResendConfirmationEmailAsync(dto);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [SwaggerOperation(
        OperationId = "ForgotPassword",
        Summary = "Ask for a password reset link",
        Description = "Sends a password reset link to the institutional e-mail and voids the previous ones. A " +
            "banned account or a request too soon after the last one answers 204 and sends nothing.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ForgotPassword([FromBody] EmailRequestDto dto)
    {
        await authService.ForgotPasswordAsync(dto);
        return NoContent();
    }

    [HttpGet("verify-reset-token")]
    [AllowAnonymous]
    [SwaggerOperation(
        OperationId = "VerifyResetToken",
        Summary = "Check a password reset token",
        Description = "Answers 204 while the token can still reset the password, without using it.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyResetToken(
        [FromQuery, SwaggerParameter("Token received in the password reset link.", Required = true)] string token)
    {
        await authService.VerifyResetTokenAsync(token);
        return NoContent();
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [SwaggerOperation(
        OperationId = "ResetPassword",
        Summary = "Reset the password",
        Description = "Sets a new password with the reset token, confirms the e-mail if it was not, ends every " +
            "open session and returns a new session token.")]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var tokenResponse = await authService.ResetPasswordAsync(dto);
        return Ok(tokenResponse);
    }

    [HttpPost("unlock")]
    [AllowAnonymous]
    [SwaggerOperation(
        OperationId = "UnlockAccount",
        Summary = "Unlock the account",
        Description = "Unlocks an account locked by wrong passwords, with the token sent by e-mail.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UnlockAccount([FromBody] UnlockAccountDto dto)
    {
        await authService.UnlockAccountAsync(dto);
        return NoContent();
    }
}
