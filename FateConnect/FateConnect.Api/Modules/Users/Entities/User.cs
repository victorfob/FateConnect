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
    public DateTime? UpdatedAt { get; set; }
    public EnumProfileType ProfileType { get; set; } = EnumProfileType.Operator;
    public int TokenVersion { get; set; }
    public string? Phone { get; set; }
    public string? ContactEmail { get; set; }
    public string? Neighborhood { get; set; }
    public EnumAccountStatus Status { get; set; } = EnumAccountStatus.Active;
    public UserPreferences Preferences { get; set; } = null!;
    public ICollection<DocumentAcceptance> DocumentAcceptances { get; set; } = [];
}
