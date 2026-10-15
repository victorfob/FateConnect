namespace FateConnect.Api.Modules.Users.Entities;

using System;
using FateConnect.Api.Modules.Users.Enums;

public record PublicationRemoval(
    EnumPublication Publication,
    Guid PublicationId,
    int OwnerId,
    string Title,
    EnumRemovalReason Reason);
