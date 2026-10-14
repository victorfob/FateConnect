namespace FateConnect.Api.Modules.Reports.Services;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Reports.DTOs;
using FateConnect.Api.Modules.Reports.Entities;
using FateConnect.Api.Modules.Reports.Exceptions;
using FateConnect.Api.Modules.Reports.Interfaces;
using FateConnect.Api.Modules.Storage.Enums;
using FateConnect.Api.Modules.Storage.Interfaces;
using FateConnect.Api.Modules.Storage.Services;
using FateConnect.Api.Modules.Users.Extensions;
using MassTransit;
using Microsoft.Extensions.Logging;

public partial class ReportService(
    IReportRepository repository,
    IStorageService baseStorageService,
    IPublishEndpoint publishEndpoint,
    TimeProvider clock,
    ILogger<ReportService> logger
) : BaseFileService(baseStorageService, logger), IReportService
{
    public async Task<ReadReportDto> CreateAsync(CreateReportDto dto, int currentUserId)
    {
        var report = new Report(
            dto.Category,
            dto.Description,
            currentUserId,
            dto.IsAnonymous,
            clock.GetUtcNow().UtcDateTime
        );

        string? storedImageUrl = null;

        if (dto.Image is not null)
        {
            storedImageUrl = await StorageService.UploadImageAsync(dto.Image, EnumStorageContainer.Report);
            report.AttachImage(storedImageUrl);
        }

        if (!report.IsAnonymous)
            await publishEndpoint.Publish(
                new ReportReceivedEvent(currentUserId, report.Id, report.Category));

        await PersistOrDropImageAsync(() => repository.AddAsync(report), storedImageUrl);

        LogReportCreated(logger, report.Id);

        return MapToReadDto(report);
    }

    public Task<PagedResultDto<ReadReportDto>> GetAllAsync(ReportFilterDto filter) =>
        ListAsync(filter, reporterId: null);

    public Task<PagedResultDto<ReadReportDto>> GetReportedByAsync(ReportFilterDto filter, int reporterId) =>
        ListAsync(filter, reporterId);

    public async Task<ReadReportDto?> GetByIdAsync(Guid id)
    {
        var report = await repository.GetByIdAsync(id, forChange: false);

        if (report is null)
        {
            LogReportNotFound(logger, id);
            return null;
        }

        LogReportFound(logger, id);

        return MapToReadDto(report);
    }

    public async Task<string?> GetStoredImageNameAsync(Guid id, int currentUserId, bool isAdministrator)
    {
        var report = await repository.GetByIdAsync(id, forChange: false);

        if (report is null)
        {
            LogReportNotFound(logger, id);
            return null;
        }

        EnsureImageIsVisibleTo(report, currentUserId, isAdministrator);

        if (report.ImageUrl is null)
            return null;

        return Path.GetFileName(report.ImageUrl);
    }

    public async Task<ReadReportDto?> UpdateStatusAsync(Guid id, UpdateReportStatusDto dto)
    {
        var report = await repository.GetByIdAsync(id);

        if (report is null)
        {
            LogReportNotFound(logger, id);
            return null;
        }

        report.UpdateStatus(dto.Status, clock.GetUtcNow().UtcDateTime);

        await repository.SaveChangesAsync();

        LogReportStatusUpdated(logger, id, dto.Status.ToString());

        return MapToReadDto(report);
    }

    private async Task<PagedResultDto<ReadReportDto>> ListAsync(ReportFilterDto filter, int? reporterId)
    {
        (IReadOnlyList<Report> records, int total) = await repository.GetAllAsync(filter, reporterId);

        LogReportsRetrieved(logger, records.Count);

        return filter.ToResult<ReadReportDto>([.. records.Select(MapToReadDto)], total);
    }

    private void EnsureImageIsVisibleTo(Report report, int currentUserId, bool isAdministrator) =>
        OwnershipGuard.EnsureOwnedBy<ReportNotReportedByUserException>(
            isAdministrator || report.IsReportedBy(currentUserId),
            () => LogReportImageRefused(logger, currentUserId, report.Id));

    private static ReadReportDto MapToReadDto(Report record) =>
        new(
            Id: record.Id,
            Category: record.Category,
            Description: record.Description,
            ImageUrl: ImageAddressOf(record),
            ThumbnailUrl: ThumbnailAddressOf(record),
            HasImage: record.ImageUrl is not null,
            Status: record.Status,
            User: record.IsAnonymous ? null : record.User?.ToContactDto(),
            IsAnonymous: record.IsAnonymous,
            CreatedAt: record.CreatedAt
        );

    private static string? ImageAddressOf(Report record)
    {
        if (record.ImageUrl is null)
            return null;

        return $"Reports/{record.Id}/image";
    }

    private static string? ThumbnailAddressOf(Report record)
    {
        if (record.ImageUrl is null)
            return null;

        return $"Reports/{record.Id}/image/thumbnail";
    }
}
