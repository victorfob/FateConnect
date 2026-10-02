namespace FateConnect.Api.Modules.Users.Services;

using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Interfaces;
using FateConnect.Api.Modules.Common.Services;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static BCrypt.Net.BCrypt;

public partial class UserService(
    IUserRepository userRepository,
    ITokenService tokenService,
    TimeProvider timeProvider,
    IStorageService baseStorageService,
    ILogger<UserService> logger
) : BaseFileService(baseStorageService), IUserService
{

    public async Task<TokenResponseDto> SignUpAsync(CreateUserDto dto, RequestOrigin origin)
    {
        await EnsureEmailIsUniqueAsync(dto.FatecEmail);

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;
        string hashedPassword = HashPassword(dto.Password);

        User newUser = new User(
            dto.FatecEmail,
            hashedPassword,
            dto.FullName,
            dto.BirthDate,
            dto.Gender,
            contact: null,
            now
        );

        UserPreferences newPreferences = new UserPreferences(
            dto.ReceiveEmails ?? false,
            dto.ReceiveNotifications ?? false
        );

        newUser.SetPreferences(newPreferences);

        foreach (var acceptanceDto in dto.Acceptances)
        {
            newUser.AddDocumentAcceptance(new DocumentAcceptance(
                documentType: acceptanceDto.Document,
                version: acceptanceDto.Version,
                acceptedAt: now,
                ipAddress: origin.IpAddress,
                userAgent: origin.UserAgent
            ));
        }

        await userRepository.AddAsync(newUser);

        LogUserCreated(logger, newUser.Id);

        return new TokenResponseDto { Token = tokenService.GenerateJwtToken(newUser) };
    }

    public async Task<ReadUserDto?> GetProfileAsync(int currentUserId)
    {
        var user = await userRepository.GetByIdAsync(currentUserId, asNoTracking: true);

        if (user is null)
        {
            LogUserNotFound(logger, currentUserId);
            return null;
        }

        return MapToReadDto(user);
    }

    public async Task<ReadUserPreferencesDto?> GetPreferencesAsync(int currentUserId)
    {
        var preferences = await userRepository.GetPreferencesByUserIdAsync(currentUserId);

        if (preferences is null)
        {
            LogUserNotFound(logger, currentUserId);
            return null;
        }

        return new ReadUserPreferencesDto(
            ReceiveEmails: preferences.ReceiveEmails,
            ReceiveNotifications: preferences.ReceiveNotifications
        );
    }

    public async Task<ReadUserDto?> UpdateProfileAsync(int currentUserId, UpdateUserDto dto)
    {
        var user = await userRepository.GetByIdAsync(currentUserId);

        if (user is null)
        {
            LogUserNotFound(logger, currentUserId);
            return null;
        }

        UserContact? newContact = ResolveContact(user, dto.Phone, dto.ContactEmail);
        await EnsureChangedContactIsUniqueAsync(user, newContact);

        user.UpdatePersonalData(
            dto.FullName ?? user.FullName,
            dto.BirthDate ?? user.BirthDate,
            dto.Gender ?? user.Gender,
            newContact,
            dto.Neighborhood ?? user.Neighborhood
        );

        string? replacedImageUrl = null;
        string? storedImageUrl = null;

        if (dto.Image is not null)
        {
            replacedImageUrl = user.ImageUrl;
            storedImageUrl = await StorageService.UploadImageAsync(dto.Image, EnumStorageContainer.User);
            user.AttachImage(storedImageUrl);
        }

        await PersistOrDropImageAsync(userRepository.SaveChangesAsync, storedImageUrl);

        if (dto.Image is not null && !string.IsNullOrWhiteSpace(replacedImageUrl))
        {
            await StorageService.DeleteImageAsync(replacedImageUrl);
        }

        LogUserProfileUpdated(logger, currentUserId);

        return MapToReadDto(user);
    }

    public async Task UpdatePreferencesAsync(int currentUserId, UpdatePreferencesDto dto)
    {
        var user = await userRepository.GetByIdAsync(currentUserId, includePreferences: true);

        if (user is null)
        {
            LogUserNotFound(logger, currentUserId);
            return;
        }

        var newPreferences = new UserPreferences(
            receiveEmails: dto.ReceiveEmails ?? user.Preferences.ReceiveEmails,
            receiveNotifications: dto.ReceiveNotifications ?? user.Preferences.ReceiveNotifications
        );

        user.SetPreferences(newPreferences);

        await userRepository.SaveChangesAsync();
    }

    public async Task<TokenResponseDto?> ChangePasswordAsync(int currentUserId, ChangePasswordDto dto)
    {
        var user = await userRepository.GetByIdAsync(currentUserId);

        if (user is null)
        {
            LogUserNotFound(logger, currentUserId);
            return null;
        }

        if (!Verify(dto.CurrentPassword, user.Password))
            throw new IncorrectCurrentPasswordException();

        user.ChangePassword(HashPassword(dto.NewPassword));

        await userRepository.SaveChangesAsync();
        LogUserPasswordChanged(logger, currentUserId);

        return new TokenResponseDto
        {
            Token = tokenService.GenerateJwtToken(user)
        };
    }

    public async Task RemoveProfileImageAsync(int currentUserId)
    {
        var user = await userRepository.GetByIdAsync(currentUserId);

        if (user is null)
        {
            LogUserNotFound(logger, currentUserId);
            return;
        }

        if (string.IsNullOrWhiteSpace(user.ImageUrl))
            return;

        string imageToDelete = user.ImageUrl;

        user.RemoveImage();

        await userRepository.SaveChangesAsync();
        await StorageService.DeleteImageAsync(imageToDelete);

        LogUserProfileUpdated(logger, currentUserId);
    }

    public async Task DeactivateAccountAsync(int currentUserId)
    {
        var user = await userRepository.GetByIdAsync(currentUserId);

        if (user is null)
        {
            LogUserNotFound(logger, currentUserId);
            return;
        }

        user.Deactivate();

        await userRepository.SaveChangesAsync();
        LogUserDeactivated(logger, currentUserId);
    }

    public async Task<PagedResultDto<ReadUserSummaryDto>> GetAllUsersAsync(UserFilterDto filter)
    {
        (IReadOnlyList<ReadUserSummaryDto> records, int total) = await userRepository.GetAllAsync(
            filter,
            u => new ReadUserSummaryDto(
                u.Id,
                u.FullName,
                u.ContactEmail,
                u.Phone,
                UploadsLocation.ThumbnailOrNullOf(u.ImageUrl),
                u.Status
            )
        );

        return new PagedResultDto<ReadUserSummaryDto>
        {
            Items = [.. records],
            Page = filter.EffectivePage,
            PageSize = filter.EffectivePageSize,
            Total = total
        };
    }

    public async Task<ReadUserDto?> GetUserByIdAsync(int id)
    {
        var user = await userRepository.GetByIdAsync(id, asNoTracking: true);

        if (user is null)
        {
            LogUserNotFound(logger, id);
            return null;
        }

        return MapToReadDto(user);
    }

    public async Task<ReadUserDto?> UpdateUserByAdminAsync(int id, AdminUpdateUserDto dto)
    {
        var user = await userRepository.GetByIdAsync(id);

        if (user is null)
        {
            LogUserNotFound(logger, id);
            return null;
        }

        string newFatecEmail = dto.FatecEmail?.Trim().ToLowerInvariant() ?? user.FatecEmail;
        UserContact? newContact = ResolveContact(user, dto.Phone, dto.ContactEmail);

        bool isFatecEmailDuplicated = newFatecEmail != user.FatecEmail &&
            await userRepository.EmailExistsAsync(newFatecEmail, excludeUserId: id);

        if (isFatecEmailDuplicated)
            throw new EmailAlreadyRegisteredException(newFatecEmail);

        await EnsureChangedContactIsUniqueAsync(user, newContact);

        user.UpdateByAdmin(
            dto.FullName ?? user.FullName,
            newFatecEmail,
            newContact
        );

        await userRepository.SaveChangesAsync();
        LogUserUpdatedByAdmin(logger, id);

        return MapToReadDto(user);
    }

    public async Task<ReadUserDto?> ChangeUserProfileAsync(int id, EnumProfileType newProfile, int currentUserId)
    {
        if (id == currentUserId)
            throw new CannotModifyOwnAccountException();

        var user = await userRepository.GetByIdAsync(id);

        if (user is null)
        {
            LogUserNotFound(logger, id);
            return null;
        }

        EnumProfileType previousProfile = user.ProfileType;

        switch (newProfile)
        {
            case EnumProfileType.Administrator:
                user.PromoteToAdministrator();
                break;
            case EnumProfileType.Operator:
                user.DemoteToOperator();
                break;
        }

        bool profileChanged = user.ProfileType != previousProfile;

        if (profileChanged)
            RecordAdministrativeAction(currentUserId, id, ProfileChangeAction(user.ProfileType));

        await userRepository.SaveChangesAsync();
        LogUserProfileTypeChangedByAdmin(logger, id, newProfile.ToString());

        return MapToReadDto(user);
    }

    public async Task<ReadUserDto?> ChangeUserStatusAsync(int id, EnumAccountStatus newStatus, int currentUserId)
    {
        if (id == currentUserId)
            throw new CannotModifyOwnAccountException();

        var user = await userRepository.GetByIdAsync(id);

        if (user is null)
        {
            LogUserNotFound(logger, id);
            return null;
        }

        EnumAccountStatus previousStatus = user.Status;
        EnumAdministrativeAction action;

        switch (newStatus)
        {
            case EnumAccountStatus.Banned:
                user.Ban();
                action = EnumAdministrativeAction.Banned;
                break;

            case EnumAccountStatus.Active when user.Status == EnumAccountStatus.Banned:
                user.ReactivateFromBan();
                action = EnumAdministrativeAction.BanReverted;
                break;

            default:
                throw new InvalidUserStatusTransitionException();
        }

        bool statusChanged = user.Status != previousStatus;

        if (statusChanged)
            RecordAdministrativeAction(currentUserId, id, action);

        await userRepository.SaveChangesAsync();
        LogUserStatusChangedByAdmin(logger, id, newStatus.ToString());

        return MapToReadDto(user);
    }

    private void RecordAdministrativeAction(int actorId, int targetId, EnumAdministrativeAction action) =>
        userRepository.AddAdministrativeAction(
            new AdministrativeAction(actorId, targetId, action, timeProvider.GetUtcNow().UtcDateTime)
        );

    private static EnumAdministrativeAction ProfileChangeAction(EnumProfileType newProfile) =>
        newProfile == EnumProfileType.Administrator
            ? EnumAdministrativeAction.Promoted
            : EnumAdministrativeAction.Demoted;

    private async Task EnsureEmailIsUniqueAsync(string email, int? excludeUserId = null)
    {
        if (await userRepository.EmailExistsAsync(email, excludeUserId))
            throw new EmailAlreadyRegisteredException(email);
    }

    private static UserContact? ResolveContact(User user, string? phone, string? contactEmail) =>
        UserContact.FromOptional(
            phone?.Trim() ?? user.Phone,
            contactEmail?.Trim().ToLowerInvariant() ?? user.ContactEmail);

    private async Task EnsureChangedContactIsUniqueAsync(User user, UserContact? newContact)
    {
        if (newContact is null)
            return;

        bool isPhoneDuplicated = newContact.Phone != user.Phone &&
            await userRepository.ContactPhoneExistsAsync(newContact.Phone, excludeUserId: user.Id);

        if (isPhoneDuplicated)
            throw new ContactPhoneAlreadyRegisteredException(newContact.Phone);

        bool isContactEmailDuplicated = newContact.ContactEmail != user.ContactEmail &&
            await userRepository.ContactEmailExistsAsync(newContact.ContactEmail, excludeUserId: user.Id);

        if (isContactEmailDuplicated)
            throw new ContactEmailAlreadyRegisteredException(newContact.ContactEmail);
    }

    private static ReadUserDto MapToReadDto(User record) =>
        new(
            Id: record.Id,
            FatecEmail: record.FatecEmail,
            FullName: record.FullName,
            BirthDate: record.BirthDate,
            Gender: record.Gender,
            Phone: record.Phone,
            ContactEmail: record.ContactEmail,
            Neighborhood: record.Neighborhood,
            ImageUrl: record.ImageUrl,
            ThumbnailUrl: UploadsLocation.ThumbnailOrNullOf(record.ImageUrl),
            ProfileType: record.ProfileType,
            Status: record.Status,
            CreatedAt: record.CreatedAt
        );
}
