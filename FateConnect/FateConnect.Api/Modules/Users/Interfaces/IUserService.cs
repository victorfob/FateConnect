namespace FateConnect.Api.Modules.Users.Services;

using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using System.Threading.Tasks;

public interface IUserService
{
    Task SignUpAsync(CreateUserDto dto, RequestOrigin origin);
    Task<ReadUserDto?> GetProfileAsync(int currentUserId);
    Task<ReadUserPreferencesDto?> GetPreferencesAsync(int currentUserId);
    Task<ReadUserDto?> UpdateProfileAsync(int currentUserId, UpdateUserDto dto);
    Task UpdatePreferencesAsync(int currentUserId, UpdatePreferencesDto dto);
    Task<TokenResponseDto?> ChangePasswordAsync(int currentUserId, ChangePasswordDto dto);
    Task DeactivateAccountAsync(int currentUserId);
    Task RemoveProfileImageAsync(int currentUserId);

    Task<PagedResultDto<ReadUserSummaryDto>> GetAllUsersAsync(UserFilterDto filter);
    Task<ReadUserDto?> GetUserByIdAsync(int id);
    Task<ReadUserDto?> UpdateUserByAdminAsync(int id, AdminUpdateUserDto dto);
    Task<ReadUserDto?> ChangeUserProfileAsync(int id, EnumProfileType newProfile, int currentUserId);
    Task<ReadUserDto?> ChangeUserStatusAsync(int id, EnumAccountStatus newStatus, int currentUserId);
}
