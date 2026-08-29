using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FateConnect.Api.Modules.Users.Controllers;

[ApiController]
[Route("[controller]")]
[Produces("application/json")]
public class UsuarioController : ControllerBase
{
    private readonly IUserService _usuarioService;

    public UsuarioController(IUserService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpPost("cadastro")]
    [AllowAnonymous]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErroResponseDto), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CadastrarAsync([FromBody] CreateUsuarioDto dto)
    {
        UsuarioResponseDto resposta = await _usuarioService.CadastrarAsync(dto);

        return StatusCode(StatusCodes.Status201Created, resposta);
    }
}
