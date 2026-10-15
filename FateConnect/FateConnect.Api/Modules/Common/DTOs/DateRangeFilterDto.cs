namespace FateConnect.Api.Modules.Common.DTOs;

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Swashbuckle.AspNetCore.Annotations;

public record DateRangeFilterDto : PagedFilterDto, IValidatableObject
{
    [SwaggerParameter("Start of the date range, inclusive: the departure for rides, the day it happened for items " +
        "and the day it was sent for reports. Alone, it filters that single day.")]
    public DateOnly? DateFrom { get; init; }
    [SwaggerParameter("End of the date range, inclusive. Alone, it filters that single day; before `DateFrom`, " +
        "it answers 400.")]
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
                "The end date cannot be before the start date.",
                [nameof(DateTo)]);
    }
}
