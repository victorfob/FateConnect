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
using FateConnect.Api.Modules.Users.Extensions;

public partial class LostAndFoundService(
    ILostAndFoundRepository repository,
    IStorageService storageService,
    ILogger<LostAndFoundService> logger
) : ILostAndFoundService
{
    public async Task<ReadLostAndFoundDto> CreateAsync(CreateLostAndFoundDto dto, int currentUserId)
    {
        var record = new LostAndFoundRecord(
            dto.Name,
            dto.LostAndFoundType.GetValueOrDefault(),
            dto.Place,
            dto.OcurredOn.GetValueOrDefault(),
            dto.Description,
            currentUserId
        );

        string? storedImageUrl = null;

        if (dto.Image is not null)
        {
            storedImageUrl = await storageService.UploadImageAsync(dto.Image, EnumStorageContainer.LostAndFound);
            record.AttachImage(storedImageUrl);
        }

        await PersistOrDropImageAsync(() => repository.AddAsync(record), storedImageUrl);

        LogRecordCreated(logger, record.Id);

        return MapToReadDto(record, currentUserId);
    }

    public async Task<PagedResultDto<ReadLostAndFoundDto>> GetAllAsync(FilterLostAndFoundDto filter, int currentUserId)
    {
        int? userIdToFilter = filter.OnlyMine == true ? currentUserId : null;

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
        var record = await repository.GetByIdAsync(id, forChange: false);

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

        record.UpdateBasicAttributes(
            dto.Name,
            dto.LostAndFoundType,
            dto.Place,
            dto.OcurredOn,
            dto.Description,
            dto.Status
        );

        string? replacedImageUrl = null;
        string? storedImageUrl = null;

        if (dto.Image is not null)
        {
            replacedImageUrl = record.ImageUrl;
            storedImageUrl = await storageService.UploadImageAsync(dto.Image, EnumStorageContainer.LostAndFound);
            record.AttachImage(storedImageUrl);
        }

        await PersistOrDropImageAsync(repository.SaveChangesAsync, storedImageUrl);

        if (!string.IsNullOrWhiteSpace(replacedImageUrl))
            await storageService.DeleteImageAsync(replacedImageUrl);

        LogRecordUpdated(logger, id);

        return MapToReadDto(record, currentUserId);
    }

    public async Task<bool> DeleteAsync(Guid id, int currentUserId)
    {
        var record = await repository.GetByIdAsync(id);

        if (record is null)
        {
            LogRecordDeletionFailed(logger, id);
            return false;
        }

        EnsureRecordIsReportedBy(record, currentUserId);

        if (record.IsDeleted)
        {
            LogRecordDeletionFailed(logger, id);
            return false;
        }

        record.MarkAsDeleted(EnumDeletionReason.User);

        await repository.SaveChangesAsync();

        LogRecordDeleted(logger, id);

        return true;
    }

    private async Task PersistOrDropImageAsync(Func<Task> persist, string? imageToDropOnFailure)
    {
        try
        {
            await persist();
        }
        catch
        {
            if (!string.IsNullOrWhiteSpace(imageToDropOnFailure))
                await storageService.DeleteImageAsync(imageToDropOnFailure);

            throw;
        }
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
            record.User.ToContactDto(),
            record.IsReportedBy(currentUserId),
            record.Status,
            record.DeletionReason,
            record.CreatedAt
        );
}
