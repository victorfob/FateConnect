using System.Globalization;
using System.Security.Claims;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.Controllers;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FateConnect.Api.Tests.Users;

public class LegalDocumentsControllerTests
{
    private const int UserId = 42;

    private sealed class AccountlessLegalDocumentService : ILegalDocumentService
    {
        public Task<IReadOnlyList<ReadLegalDocumentDto>?> GetStatusAsync(int currentUserId) =>
            Task.FromResult<IReadOnlyList<ReadLegalDocumentDto>?>(null);

        public Task<bool> AcceptAsync(int currentUserId, AcceptDocumentsDto dto, RequestOrigin origin) =>
            Task.FromResult(false);
    }

    private static LegalDocumentsController ControllerForAMissingAccount() =>
        new(new AccountlessLegalDocumentService())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(
                        [new Claim(ClaimTypes.NameIdentifier, UserId.ToString(CultureInfo.InvariantCulture))],
                        "Bearer")),
                },
            },
        };

    [Fact]
    public async Task GetStatus_ForAMissingAccount_AnswersNotFound()
    {
        ActionResult<IReadOnlyList<ReadLegalDocumentDto>> result = await ControllerForAMissingAccount().GetStatusAsync();

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Accept_ForAMissingAccount_AnswersNotFound()
    {
        AcceptDocumentsDto dto = new()
        {
            Acceptances = [new DocumentAcceptanceDto { Document = EnumDocumentType.TermsOfUse, Version = "2026-10-14" }],
        };

        ActionResult result = await ControllerForAMissingAccount().AcceptAsync(dto);

        Assert.IsType<NotFoundResult>(result);
    }
}
