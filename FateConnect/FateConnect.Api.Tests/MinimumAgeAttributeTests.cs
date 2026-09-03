using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.Validation;

namespace FateConnect.Api.Tests;

public class MinimumAgeAttributeTests
{
    private const int MinimumAge = 18;

    private static readonly DateTimeOffset Today = new(2026, 9, 2, 12, 0, 0, TimeSpan.Zero);

    private static ValidationResult? Validate(object? value)
    {
        MinimumAgeAttribute attribute = new(MinimumAge) { ErrorMessage = "recusado" };

        ValidationContext context = new(
            new object(),
            new FixedClockProvider(new FixedTimeProvider(Today)),
            items: null);

        return attribute.GetValidationResult(value, context);
    }

    [Fact]
    public void IsValid_WithTheBirthDateOfWhoTurnsTheAgeToday_Succeeds()
    {
        ValidationResult? result = Validate(Today.UtcDateTime.Date.AddYears(-MinimumAge));

        Assert.Equal(ValidationResult.Success, result);
    }

    [Fact]
    public void IsValid_WithTheBirthDateOfWhoTurnedTheAgeYesterday_Succeeds()
    {
        ValidationResult? result = Validate(Today.UtcDateTime.Date.AddYears(-MinimumAge).AddDays(-1));

        Assert.Equal(ValidationResult.Success, result);
    }

    [Fact]
    public void IsValid_WithTheBirthDateOfWhoTurnsTheAgeTomorrow_Fails()
    {
        ValidationResult? result = Validate(Today.UtcDateTime.Date.AddYears(-MinimumAge).AddDays(1));

        Assert.Equal("recusado", result?.ErrorMessage);
    }

    [Fact]
    public void IsValid_WithAValueThatIsNotADate_LeavesTheAbsenceToTheRequiredValidation()
    {
        Assert.Equal(ValidationResult.Success, Validate(null));
        Assert.Equal(ValidationResult.Success, Validate("não é data"));
    }
}
