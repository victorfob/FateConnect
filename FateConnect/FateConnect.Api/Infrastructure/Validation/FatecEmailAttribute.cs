namespace FateConnect.Api.Infrastructure.Validation;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Common.Constants;

[AttributeUsage(AttributeTargets.Property)]
public sealed class FatecEmailAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string email || email.Length == 0)
            return ValidationResult.Success;

        if (!RegexConstants.DomainRegex().IsMatch(email))
            return new ValidationResult(RegexConstants.FatecEmailDomainErrorMessage);

        if (!RegexConstants.LocalPartRegex().IsMatch(email))
            return new ValidationResult(RegexConstants.FatecEmailLocalPartErrorMessage);

        return ValidationResult.Success;
    }
}
