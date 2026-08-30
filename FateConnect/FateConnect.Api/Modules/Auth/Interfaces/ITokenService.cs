using FateConnect.Api.Modules.Users.Entities;

namespace FateConnect.Api.Modules.Auth.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user);
}
