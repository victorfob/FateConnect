namespace FateConnect.Api.Modules.Users.Entities;

using System;
using FateConnect.Api.Modules.Users.Enums;

public class AdministrativeAction
{
    public int Id { get; init; }
    public int ActorId { get; private set; }
    public int TargetId { get; private set; }
    public EnumAdministrativeAction Action { get; private set; }
    public DateTime PerformedAt { get; private set; }
    public Guid? PublicationId { get; private set; }
    public EnumRemovalReason? RemovalReason { get; private set; }

    protected AdministrativeAction() { }

    public AdministrativeAction(int actorId, int targetId, EnumAdministrativeAction action, DateTime performedAt)
    {
        ActorId = actorId;
        TargetId = targetId;
        Action = action;
        PerformedAt = performedAt;
    }

    public static AdministrativeAction ForRemoval(
        int actorId,
        EnumAdministrativeAction action,
        PublicationRemoval removal,
        DateTime performedAt) =>
        new(actorId, removal.OwnerId, action, performedAt)
        {
            PublicationId = removal.PublicationId,
            RemovalReason = removal.Reason,
        };
}
