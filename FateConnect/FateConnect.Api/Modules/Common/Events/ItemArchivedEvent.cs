namespace FateConnect.Api.Modules.Common.Events;

using System;

public record ItemArchivedEvent(
    int OwnerId,
    Guid RecordId,
    string ItemName);
