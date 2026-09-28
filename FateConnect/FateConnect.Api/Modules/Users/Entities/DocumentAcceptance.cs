namespace FateConnect.Api.Modules.Users.Entities;

using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;
using System;

public class DocumentAcceptance
{
    public int Id { get; init; }
    public int UserId { get; init; }
    public EnumDocumentType DocumentType { get; private set; }
    public string Version { get; private set; } = string.Empty;
    public DateTime AcceptedAt { get; private set; }
    public string IpAddress { get; private set; } = string.Empty;
    public string UserAgent { get; private set; } = string.Empty;

    public User User { get; init; } = null!;

    protected DocumentAcceptance() { }

    public DocumentAcceptance(
        EnumDocumentType documentType,
        string version,
        DateTime acceptedAt,
        string ipAddress,
        string userAgent)
    {
        if (string.IsNullOrWhiteSpace(version))
            throw new InvalidDocumentVersionException();

        DocumentType = documentType;
        Version = version.Trim();
        AcceptedAt = acceptedAt;

        IpAddress = ipAddress?.Trim() ?? "Unknown";
        UserAgent = userAgent?.Trim() ?? "Unknown";
    }
}
