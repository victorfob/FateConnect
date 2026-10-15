namespace FateConnect.Api.Modules.Users.Interfaces;

using System.Collections.Generic;
using FateConnect.Api.Modules.Users.Enums;

public interface ILegalDocumentVersions
{
    IReadOnlyDictionary<EnumDocumentType, string> Current { get; }

    bool IsCurrent(EnumDocumentType document, string version);
}
