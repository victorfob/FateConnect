namespace FateConnect.Api.Modules.Denunciations.Services;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Interfaces;
using FateConnect.Api.Modules.Denunciations.DTOs;
using FateConnect.Api.Modules.Denunciations.Entities;
using FateConnect.Api.Modules.Denunciations.Exceptions;
using FateConnect.Api.Modules.Denunciations.Interfaces;
using FateConnect.Api.Modules.Users.Extensions;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using FateConnect.Api.Modules.Common.Services;

public partial class DenunciationService(
    IDenunciationRepository repository,
    IStorageService baseStorageService,
    ILogger<DenunciationService> logger
) : BaseFileService(baseStorageService), IDenunciationService
{
    public async Task<ReadDenunciationDto> CreateAsync(CreateDenunciationDto dto, int currentUserId)
    {
        var denunciation = new Denunciation(
            dto.Category,
            dto.Description,
            currentUserId,
            dto.IsAnonymous
        );

        string? storedImageUrl = null;

        if (dto.Image is not null)
        {
            storedImageUrl = await StorageService.UploadImageAsync(dto.Image, EnumStorageContainer.Denunciation);
            denunciation.AttachImage(storedImageUrl);
        }

        await PersistOrDropImageAsync(() => repository.AddAsync(denunciation), storedImageUrl);

        LogDenunciationCreated(logger, denunciation.Id);

        return MapToReadDto(denunciation);
    }

    public Task<PagedResultDto<ReadDenunciationDto>> GetAllAsync(DenunciationFilterDto filter) =>
        ListAsync(filter, reporterId: null);

    public Task<PagedResultDto<ReadDenunciationDto>> GetReportedByAsync(DenunciationFilterDto filter, int reporterId) =>
        ListAsync(filter, reporterId);

    public async Task<ReadDenunciationDto?> GetByIdAsync(Guid id)
    {
        var denunciation = await repository.GetByIdAsync(id, forChange: false);

        if (denunciation is null)
        {
            LogDenunciationNotFound(logger, id);
            return null;
        }

        LogDenunciationFound(logger, id);

        return MapToReadDto(denunciation);
    }

    public async Task<string?> GetStoredImageNameAsync(Guid id, int currentUserId, bool isAdministrator)
    {
        var denunciation = await repository.GetByIdAsync(id, forChange: false);

        if (denunciation is null)
        {
            LogDenunciationNotFound(logger, id);
            return null;
        }

        EnsureImageIsVisibleTo(denunciation, currentUserId, isAdministrator);

        if (denunciation.ImageUrl is null)
            return null;

        return Path.GetFileName(denunciation.ImageUrl);
    }

    public async Task<ReadDenunciationDto?> UpdateStatusAsync(Guid id, UpdateDenunciationStatusDto dto)
    {
        var denunciation = await repository.GetByIdAsync(id);

        if (denunciation is null)
        {
            LogDenunciationNotFound(logger, id);
            return null;
        }

        denunciation.UpdateStatus(dto.Status);

        await repository.SaveChangesAsync();

        LogDenunciationStatusUpdated(logger, id, dto.Status.ToString());

        return MapToReadDto(denunciation);
    }

    private async Task<PagedResultDto<ReadDenunciationDto>> ListAsync(DenunciationFilterDto filter, int? reporterId)
    {
        (IReadOnlyList<Denunciation> records, int total) = await repository.GetAllAsync(filter, reporterId);

        LogDenunciationsRetrieved(logger, records.Count);

        return new PagedResultDto<ReadDenunciationDto>
        {
            Items = [.. records.Select(MapToReadDto)],
            Page = filter.EffectivePage,
            PageSize = filter.EffectivePageSize,
            Total = total,
        };
    }

    private void EnsureImageIsVisibleTo(Denunciation denunciation, int currentUserId, bool isAdministrator)
    {
        if (isAdministrator || denunciation.IsReportedBy(currentUserId))
            return;

        LogDenunciationImageRefused(logger, currentUserId, denunciation.Id);

        throw new DenunciationNotReportedByUserException();
    }

    private static ReadDenunciationDto MapToReadDto(Denunciation record) =>
        new(
            Id: record.Id,
            Category: record.Category,
            Description: record.Description,
            ImageUrl: ImageAddressOf(record),
            HasImage: record.ImageUrl is not null,
            Status: record.Status,
            User: record.IsAnonymous ? null : record.User?.ToContactDto(),
            IsAnonymous: record.IsAnonymous,
            CreatedAt: record.CreatedAt
        );

    private static string? ImageAddressOf(Denunciation record)
    {
        if (record.ImageUrl is null)
            return null;

        return $"Denunciations/{record.Id}/image";
    }
}
