namespace FateConnect.Api.Modules.Users.Entities;

public class Contact
{
    public int Id { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
