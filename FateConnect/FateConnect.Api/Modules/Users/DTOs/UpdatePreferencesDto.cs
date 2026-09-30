namespace FateConnect.Api.Modules.Users.DTOs;

public class UpdatePreferencesDto
{
    public bool? ReceiveEmails { get; set; }
    public bool? ReceiveNotifications { get; set; }
}
