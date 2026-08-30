namespace FateConnect.Api.Modules.Users.Entities;

public class Address
{
    public int Id { get; set; }
    public string ZipCode { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string StreetNumber { get; set; } = string.Empty;
    public string Complement { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
