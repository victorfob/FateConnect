namespace FateConnect.Api.Modules.LostAndFound.Services;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Exceptions;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.Storage.Enums;
using FateConnect.Api.Modules.Storage.Interfaces;
using FateConnect.Api.Modules.Storage.Services;
using FateConnect.Api.Modules.Storage.Utils;
using FateConnect.Api.Modules.Users.Extensions;
using Microsoft.Extensions.Logging;

public partial class LostAndFoundService(
    ILostAndFoundRepository repository,
    IStorageService baseStorageService,
    TimeProvider clock,
    ILogger<LostAndFoundService> logger
) : BaseFileService(baseStorageService, logger), ILostAndFoundService
{
    public async Task<ReadLostAndFoundDto> CreateAsync(CreateLostAndFoundDto dto, int currentUserId)
    {
        var record = new LostAndFoundRecord(
            dto.Name,
            dto.LostAndFoundType.GetValueOrDefault(),
            dto.Place,
            dto.OccurredOn.GetValueOrDefault(),
            dto.Description,
            currentUserId,
            clock.GetUtcNow().UtcDateTime
        );

        string? storedImageUrl = null;

        if (dto.Image is not null)
        {
            storedImageUrl = await StorageService.UploadImageAsync(dto.Image, EnumStorageContainer.LostAndFound);
            record.AttachImage(storedImageUrl);
        }

        await PersistOrDropImageAsync(() => repository.AddAsync(record), storedImageUrl);

        LogRecordCreated(logger, record.Id);

        return MapToReadDto(record, currentUserId);
    }

    public async Task<PagedResultDto<ReadLostAndFoundDto>> GetAllAsync(LostAndFoundFilterDto filter, int currentUserId)
    {
        int? userIdToFilter = filter.OnlyMine == true ? currentUserId : null;

        (IReadOnlyList<LostAndFoundRecord> records, int total) = await repository.GetAllAsync(filter, userIdToFilter);

        LogRecordsRetrieved(logger, records.Count);

        return filter.ToResult<ReadLostAndFoundDto>(
            [.. records.Select(record => MapToReadDto(record, currentUserId))],
            total);
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
            dto.OccurredOn,
            dto.Description,
            dto.Status,
            clock.GetUtcNow().UtcDateTime
        );

        string? discardedImageUrl = null;
        string? storedImageUrl = null;
        bool removesImage = dto.Image is null && dto.RemoveImage == true;

        if (dto.Image is not null)
        {
            discardedImageUrl = record.ImageUrl;
            storedImageUrl = await StorageService.UploadImageAsync(dto.Image, EnumStorageContainer.LostAndFound);
            record.AttachImage(storedImageUrl);
        }

        if (removesImage)
        {
            discardedImageUrl = record.ImageUrl;
            record.DetachImage();
        }

        await PersistOrDropImageAsync(repository.SaveChangesAsync, storedImageUrl);

        if (!string.IsNullOrWhiteSpace(discardedImageUrl))
            await StorageService.DeleteImageAsync(discardedImageUrl);

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

        record.MarkAsDeleted(EnumDeletionReason.User, clock.GetUtcNow().UtcDateTime);

        await repository.SaveChangesAsync();

        LogRecordDeleted(logger, id);

        return true;
    }

    private void EnsureRecordIsReportedBy(LostAndFoundRecord record, int currentUserId) =>
        OwnershipGuard.EnsureOwnedBy<LostAndFoundNotReportedByUserException>(
            record.IsReportedBy(currentUserId),
            () => LogRecordChangeRefused(logger, currentUserId, record.Id));

    private static ReadLostAndFoundDto MapToReadDto(LostAndFoundRecord record, int currentUserId) =>
        new(
            record.Id,
            record.Name,
            record.LostAndFoundType,
            record.Place,
            record.OccurredOn,
            record.Description,
            record.ImageUrl,
            UploadsLocation.ThumbnailOrNullOf(record.ImageUrl),
            record.User.ToContactDto(),
            record.IsReportedBy(currentUserId),
            record.Status,
            record.DeletionReason,
            record.CreatedAt
        );
}
