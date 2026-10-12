namespace FateConnect.Api.Modules.Common.Events;

using System;
using FateConnect.Api.Modules.Denunciations.Enums;

public record DenunciationReceivedEvent(
    int ReporterId,
    Guid DenunciationId,
    EnumDenunciationCategory Category);
