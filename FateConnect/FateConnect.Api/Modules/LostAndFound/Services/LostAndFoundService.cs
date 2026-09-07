namespace FateConnect.Api.Modules.LostAndFound.Services;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Exceptions;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Common.Interfaces;
using FateConnect.Api.Modules.Common.Enums;
using Microsoft.Extensions.Logging;

public partial class LostAndFoundService(
    ILostAndFoundRepository repository,
    IStorageService storageService,
    ILogger<LostAndFoundService> logger
) : ILostAndFoundService
{
    public async Task<ReadLostAndFoundDto> CreateAsync(CreateLostAndFoundDto dto, int currentUserId)
    {
        string? imageUrl = dto.Image is not null
            ? await storageService.UploadImageAsync(dto.Image, EnumStorageContainer.LostAndFound)
            : null;

        var record = new LostAndFoundRecord(
            dto.Name,
            dto.LostAndFoundType,
            dto.Place,
            dto.OcurredOn,
            dto.Description,
            currentUserId,
            EnumStatusLostAndFound.Open,
            imageUrl
        );

        await repository.AddAsync(record);

        LogRecordCreated(logger, record.Id);

        return MapToReadDto(record, currentUserId);
    }

    public async Task<PagedResultDto<ReadLostAndFoundDto>> GetAllAsync(FilterLostAndFoundDto filter, int currentUserId)
    {
        int? userIdToFilter = filter.OnlyMyItems == true ? currentUserId : null;

        (IReadOnlyList<LostAndFoundRecord> records, int total) = await repository.GetAllAsync(filter, userIdToFilter);

        LogRecordsRetrieved(logger, records.Count);

        return new PagedResultDto<ReadLostAndFoundDto>
        {
            Items = [.. records.Select(record => MapToReadDto(record, currentUserId))],
            Page = filter.EffectivePage,
            PageSize = filter.EffectivePageSize,
            Total = total,
        };
    }

    public async Task<ReadLostAndFoundDto?> GetByIdAsync(Guid id, int currentUserId)
    {
        var record = await repository.GetByIdAsync(id);

        if (record is null)
        {
            LogRecordNotFound(logger, id);

            return null;
        }

        LogRecordFound(logger, id);

        return MapToReadDto(record, currentUserId);
    }

    public async Task<ReadLostAndFoundDto?> UpdateAsync(Guid id, UpdateLostAndFoundDto dto, int currentUserId)
    {
        var record = await repository.GetByIdAsync(id);

        if (record is null)
        {
            LogRecordNotFound(logger, id);

            return null;
        }

        EnsureRecordIsReportedBy(record, currentUserId);


        string? newImageUrl = record.ImageUrl;

        if (dto.Image is not null)
        {
            await storageService.DeleteImageAsync(record.ImageUrl!);

            newImageUrl = await storageService.UploadImageAsync(dto.Image, EnumStorageContainer.LostAndFound);
        }

        record.UpdateBasicAttributes(
            dto.Name,
            dto.LostAndFoundType,
            dto.Place,
            dto.OcurredOn,
            dto.Description,
            dto.Status,
            newImageUrl
        );

        await repository.UpdateAsync(record);

        LogRecordUpdated(logger, id);

        return MapToReadDto(record, currentUserId);
    }

    public async Task<bool> DeleteAsync(Guid id, int currentUserId)
    {
        var record = await repository.GetByIdAsync(id);

        if (record is null)
        {
            LogRecordDeactivationFailed(logger, id);
            return false;
        }

        EnsureRecordIsReportedBy(record, currentUserId);

        record.MarkAsDeleted();

        await repository.UpdateAsync(record);

        LogRecordDeactivated(logger, id);

        return true;
    }

    private void EnsureRecordIsReportedBy(LostAndFoundRecord record, int currentUserId)
    {
        if (record.IsReportedBy(currentUserId))
            return;

        LogRecordChangeRefused(logger, currentUserId, record.Id);

        throw new LostAndFoundNotReportedByUserException();
    }

    private static ReadLostAndFoundDto MapToReadDto(LostAndFoundRecord record, int currentUserId) =>
        new(
            record.Id,
            record.Name,
            record.LostAndFoundType,
            record.Place,
            record.OcurredOn,
            record.Description,
            record.ImageUrl,
            MapUserToContactDto(record.User),
            record.IsReportedBy(currentUserId),
            record.Status,
            record.CreatedAt
        );

    private static UserContactDto MapUserToContactDto(User user)
    {
        Contact contact = user.Contacts.First();
        return new UserContactDto(user.FullName, contact.ContactEmail, contact.Phone);
    }
}
