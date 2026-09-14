namespace FateConnect.Api.Modules.Denunciations.Services;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Interfaces;
using FateConnect.Api.Modules.Denunciations.DTOs;
using FateConnect.Api.Modules.Denunciations.Entities;
using FateConnect.Api.Modules.Denunciations.Interfaces;
using FateConnect.Api.Modules.Users.Extensions;
using Microsoft.Extensions.Logging;
using System;
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

        return MapToReporterDto(denunciation);
    }

    public async Task<PagedResultDto<ReadDenunciationDto>> GetAllAsync(
        DenunciationFilterDto filter, int currentUserId, bool isAdministrator)
    {
        int? reporterId = isAdministrator ? null : currentUserId;

        (IReadOnlyList<Denunciation> records, int total) = await repository.GetAllAsync(filter, reporterId);

        LogDenunciationsRetrieved(logger, records.Count);

        Func<Denunciation, ReadDenunciationDto> toDto = isAdministrator ? MapToReadDto : MapToReporterDto;

        return new PagedResultDto<ReadDenunciationDto>
        {
            Items = [.. records.Select(toDto)],
            Page = filter.EffectivePage,
            PageSize = filter.EffectivePageSize,
            Total = total,
        };
    }

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

    private static ReadDenunciationDto MapToReporterDto(Denunciation record) =>
        MapToReadDto(record) with { ImageUrl = null };

    private static ReadDenunciationDto MapToReadDto(Denunciation record) =>
        new(
            Id: record.Id,
            Category: record.Category,
            Description: record.Description,
            ImageUrl: record.ImageUrl,
            HasImage: record.ImageUrl is not null,
            Status: record.Status,
            User: record.IsAnonymous ? null : record.User?.ToContactDto(),
            IsAnonymous: record.IsAnonymous,
            CreatedAt: record.CreatedAt
        );
}
