namespace FateConnect.Api.Modules.Common.Events;

using System;

public record DenunciationReceivedEvent(
    int ReporterId,
    Guid DenunciationId,
    string Reason,
    bool IsAnonymous);
