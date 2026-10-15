namespace FateConnect.Api.Modules.Users.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.DTOs;

public interface ILegalDocumentService
{
    Task<IReadOnlyList<ReadLegalDocumentDto>?> GetStatusAsync(int currentUserId);
    Task<bool> AcceptAsync(int currentUserId, AcceptDocumentsDto dto, RequestOrigin origin);
}
