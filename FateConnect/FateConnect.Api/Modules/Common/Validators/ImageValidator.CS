namespace FateConnect.Api.Modules.Common.Validators;

using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.AspNetCore.Http;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class ValidImageAttribute : ValidationAttribute
{
    private const int numberOfMegabytes = 5;
    private const int MaxFileSizeInBytes = numberOfMegabytes * 1024 * 1024;
    private static readonly string[] AllowedContentTypes = ["image/jpeg", "image/png", "image/webp"];

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not IFormFile image)
            return ValidationResult.Success;

        if (image.Length == 0)
            return new ValidationResult("A imagem enviada está vazia ou corrompida.");

        if (image.Length > MaxFileSizeInBytes)
            return new ValidationResult($"O tamanho da imagem não pode ultrapassar {numberOfMegabytes}MB.");

        if (!AllowedContentTypes.Contains(image.ContentType))
            return new ValidationResult("Formato de imagem não suportado. Apenas JPG, PNG ou WEBP são permitidos.");

        return ValidationResult.Success;
    }
}