namespace FateConnect.Api.Modules.Common.Utils;

using FateConnect.Api.Modules.Common.Exceptions;

public static class OwnershipGuard
{
    public static void EnsureOwnedBy<TRefusal>(bool isOwner, Action logRefusal)
        where TRefusal : NotOwnedByUserException, new()
    {
        if (isOwner)
            return;

        logRefusal();

        throw new TRefusal();
    }
}
