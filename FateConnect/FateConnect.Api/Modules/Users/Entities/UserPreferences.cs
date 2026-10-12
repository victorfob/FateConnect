namespace FateConnect.Api.Modules.Users.Entities;

public class UserPreferences
{
    public int UserId { get; init; }
    public bool ReceiveNotifications { get; private set; }

    protected UserPreferences() { }

    public UserPreferences(bool receiveNotifications)
    {
        ReceiveNotifications = receiveNotifications;
    }
}
