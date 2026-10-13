namespace FateConnect.Api.Modules.Reports.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public record CreateReportDto : IWaivesContact
{
    [Required(ErrorMessage = "A categoria da denúncia é obrigatória.")]
    public required EnumReportCategory Category { get; init; }

    private readonly string _description = string.Empty;

    [StringLength(500, MinimumLength = 10, ErrorMessage = "A descrição deve ter entre 10 e 500 caracteres.")]
    public required string Description
    {
        get => _description;
        init => _description = value?.Trim() ?? string.Empty;
    }

    public required bool IsAnonymous { get; init; }

    [BindNever]
    public bool WaivesContact => IsAnonymous;

    [ValidImage]
    public IFormFile? Image { get; init; }
}
