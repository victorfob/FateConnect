namespace FateConnect.Api.Modules.Users.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.Extensions.Logging;

public partial class LegalDocumentService(
    IUserRepository userRepository,
    ILegalDocumentVersions versions,
    TimeProvider timeProvider,
    ILogger<LegalDocumentService> logger
) : ILegalDocumentService
{
    public async Task<IReadOnlyList<ReadLegalDocumentDto>?> GetStatusAsync(int currentUserId)
    {
        User? user = await userRepository.GetByIdAsync(
            currentUserId,
            asNoTracking: true,
            includeDocumentAcceptances: true);

        if (user is null)
        {
            LogUserNotFound(logger, currentUserId);
            return null;
        }

        List<ReadLegalDocumentDto> statusOfEachCurrentDocument =
        [
            .. versions.Current
                .OrderBy(entry => entry.Key)
                .Select(entry => new ReadLegalDocumentDto(
                    Document: entry.Key,
                    CurrentVersion: entry.Value,
                    AcceptedCurrentVersion: user.HasAccepted(entry.Key, entry.Value)))
        ];

        return statusOfEachCurrentDocument;
    }

    public async Task<bool> AcceptAsync(int currentUserId, AcceptDocumentsDto dto, RequestOrigin origin)
    {
        User? user = await userRepository.GetByIdAsync(currentUserId, includeDocumentAcceptances: true);

        if (user is null)
        {
            LogUserNotFound(logger, currentUserId);
            return false;
        }

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        IEnumerable<DocumentAcceptanceDto> notYetAccepted = dto.Acceptances
            .DistinctBy(acceptance => acceptance.Document)
            .Where(acceptance => !user.HasAccepted(acceptance.Document, acceptance.Version))
            .ToList();

        foreach (DocumentAcceptanceDto acceptance in notYetAccepted)
        {
            user.AddDocumentAcceptance(new DocumentAcceptance(
                documentType: acceptance.Document,
                version: acceptance.Version,
                acceptedAt: now,
                ipAddress: origin.IpAddress,
                userAgent: origin.UserAgent
            ), now);

            LogDocumentAccepted(logger, currentUserId, acceptance.Document, acceptance.Version);
        }

        await userRepository.SaveChangesAsync();

        return true;
    }
}
