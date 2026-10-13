namespace FateConnect.Api.Modules.Common.Events;

using System;
using FateConnect.Api.Modules.Reports.Enums;

public record ReportReceivedEvent(
    int ReporterId,
    Guid ReportId,
    EnumReportCategory Category);
