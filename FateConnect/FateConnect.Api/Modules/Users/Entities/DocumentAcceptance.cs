namespace FateConnect.Api.Modules.Users.Entities;

using FateConnect.Api.Modules.Users.Enums;

public class DocumentAcceptance
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public EnumDocumentType DocumentType { get; set; }
    public string Version { get; set; } = string.Empty;
    public DateTime AcceptedAt { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public User User { get; set; } = null!;
}
