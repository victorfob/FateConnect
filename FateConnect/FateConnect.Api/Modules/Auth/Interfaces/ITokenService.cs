namespace FateConnect.Api.Modules.Auth.Interfaces;

using FateConnect.Api.Modules.Users.Entities;

public interface ITokenService
{
    string GenerateJwtToken(User user);
}
