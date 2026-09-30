namespace FateConnect.Api.Modules.Users.Entities;

public class UserPreferences
{
    public int UserId { get; init; }
    public bool ReceiveEmails { get; private set; }
    public bool ReceiveNotifications { get; private set; }

    protected UserPreferences() { }

    public UserPreferences(bool receiveEmails, bool receiveNotifications)
    {
        ReceiveEmails = receiveEmails;
        ReceiveNotifications = receiveNotifications;
    }
}
