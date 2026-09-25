namespace FateConnect.Api.Modules.Users.Entities;

public class UserPreferences
{
    public int UserId { get; set; }
    public bool ReceiveEmails { get; set; }
    public bool ReceiveNotifications { get; set; }
}
