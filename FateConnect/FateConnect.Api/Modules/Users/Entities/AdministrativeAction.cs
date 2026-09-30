namespace FateConnect.Api.Modules.Users.Entities;

using FateConnect.Api.Modules.Users.Enums;
using System;

public class AdministrativeAction
{
    public int Id { get; init; }
    public int ActorId { get; private set; }
    public int TargetId { get; private set; }
    public EnumAdministrativeAction Action { get; private set; }
    public DateTime PerformedAt { get; private set; }

    protected AdministrativeAction() { }

    public AdministrativeAction(int actorId, int targetId, EnumAdministrativeAction action, DateTime performedAt)
    {
        ActorId = actorId;
        TargetId = targetId;
        Action = action;
        PerformedAt = performedAt;
    }
}
