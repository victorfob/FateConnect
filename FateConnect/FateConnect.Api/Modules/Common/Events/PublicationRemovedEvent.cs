namespace FateConnect.Api.Modules.Common.Events;

using System;
using FateConnect.Api.Modules.Users.Enums;

public record PublicationRemovedEvent(
    int OwnerId,
    Guid PublicationId,
    EnumPublication Publication,
    string Title,
    EnumRemovalReason Reason);
