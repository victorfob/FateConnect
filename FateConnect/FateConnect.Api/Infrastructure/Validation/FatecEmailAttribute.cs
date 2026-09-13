namespace FateConnect.Api.Infrastructure.Validation;

using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using FateConnect.Api.Modules.Common.Constants;

[AttributeUsage(AttributeTargets.Property)]
public sealed partial class FatecEmailAttribute : ValidationAttribute
{
    [GeneratedRegex(RegexConstants.FatecEmailDomainPattern)]
    private static partial Regex DomainPattern();

    [GeneratedRegex(RegexConstants.FatecEmailLocalPartPattern)]
    private static partial Regex LocalPartPattern();

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string email || email.Length == 0)
            return ValidationResult.Success;

        if (!DomainPattern().IsMatch(email))
            return new ValidationResult(RegexConstants.FatecEmailDomainErrorMessage);

        if (!LocalPartPattern().IsMatch(email))
            return new ValidationResult(RegexConstants.FatecEmailLocalPartErrorMessage);

        return ValidationResult.Success;
    }
}
