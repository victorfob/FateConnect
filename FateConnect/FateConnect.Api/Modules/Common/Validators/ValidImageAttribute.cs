namespace FateConnect.Api.Modules.Common.Validators;

using System;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Common.Utils;
using Microsoft.AspNetCore.Http;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class ValidImageAttribute : ValidationAttribute
{
    private const int NumberOfMegabytes = 5;
    private const int MaxFileSizeInBytes = NumberOfMegabytes * 1024 * 1024;
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not IFormFile image)
            return ValidationResult.Success;

        if (image.Length == 0)
            return new ValidationResult("A imagem enviada está vazia ou corrompida.");

        if (image.Length > MaxFileSizeInBytes)
            return new ValidationResult($"O tamanho da imagem não pode ultrapassar {NumberOfMegabytes}MB.");

        if (!ImageContentTypes.IsSupported(image.ContentType))
            return new ValidationResult(ImageContentTypes.UnsupportedMessage);

        return ValidationResult.Success;
    }
}