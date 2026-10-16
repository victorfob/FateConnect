namespace FateConnect.Api.Infrastructure.Validation;

using System.ComponentModel.DataAnnotations;

[AttributeUsage(AttributeTargets.Property)]
public sealed class MinimumAgeAttribute : ValidationAttribute
{
    private readonly int _years;

    public MinimumAgeAttribute(int years)
    {
        _years = years;
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not DateOnly birthDate)
            return ValidationResult.Success;

        DateOnly today = DateOnly.FromDateTime(ClockFrom(validationContext).GetUtcNow().UtcDateTime);
        DateOnly latestAccepted = today.AddYears(-_years);

        if (birthDate <= latestAccepted)
            return ValidationResult.Success;

        return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
    }

    private static TimeProvider ClockFrom(ValidationContext validationContext)
    {
        if (validationContext.GetService(typeof(TimeProvider)) is TimeProvider provided)
            return provided;

        return TimeProvider.System;
    }
}
