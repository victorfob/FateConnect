namespace FateConnect.Api.Modules.Users.Entities;

using FateConnect.Api.Modules.Users.Enums;

public class User
{
    public int Id { get; set; }
    public string FatecEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public EnumGender Gender { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public EnumProfileType ProfileType { get; set; }
    public ICollection<Address> Addresses { get; set; } = [];
    public ICollection<Contact> Contacts { get; set; } = [];
}
