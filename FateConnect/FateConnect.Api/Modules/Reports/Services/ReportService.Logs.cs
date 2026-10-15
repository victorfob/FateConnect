namespace FateConnect.Api.Modules.Reports.Services;

using System;
using Microsoft.Extensions.Logging;

public partial class ReportService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Report {ReportId} created successfully.")]
    private static partial void LogReportCreated(ILogger logger, Guid reportId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "{ReportsCount} reports retrieved successfully.")]
    private static partial void LogReportsRetrieved(ILogger logger, int reportsCount);

    [LoggerMessage(EventId = 3, Level = LogLevel.Warning, Message = "Report {ReportId} not found.")]
    private static partial void LogReportNotFound(ILogger logger, Guid reportId);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information, Message = "Report {ReportId} found.")]
    private static partial void LogReportFound(ILogger logger, Guid reportId);

    [LoggerMessage(
        EventId = 5,
        Level = LogLevel.Information,
        Message = "Report {ReportId} status updated to {Status} successfully.")]
    private static partial void LogReportStatusUpdated(ILogger logger, Guid reportId, string status);

    [LoggerMessage(
        EventId = 6,
        Level = LogLevel.Warning,
        Message = "User ID {UserId} was refused the image of report {ReportId}.")]
    private static partial void LogReportImageRefused(ILogger logger, int userId, Guid reportId);
}
