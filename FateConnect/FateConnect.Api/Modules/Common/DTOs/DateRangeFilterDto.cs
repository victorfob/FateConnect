namespace FateConnect.Api.Modules.Common.DTOs;

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public record DateRangeFilterDto : PagedFilterDto, IValidatableObject
{
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }

    [BindNever]
    public DateOnly? EffectiveDateFrom => DateFrom ?? DateTo;

    [BindNever]
    public DateOnly? EffectiveDateTo => DateTo ?? DateFrom;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        bool isRangeInverted = DateFrom.HasValue
            && DateTo.HasValue
            && DateTo.Value < DateFrom.Value;

        if (isRangeInverted)
            yield return new ValidationResult(
                "A data final não pode ser anterior à data inicial.",
                [nameof(DateTo)]);
    }
}
