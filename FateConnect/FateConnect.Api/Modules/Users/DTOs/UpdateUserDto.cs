namespace FateConnect.Api.Modules.Users.DTOs;

using System;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;

public class UpdateUserDto
{
    [StringLength(200, MinimumLength = 3, ErrorMessage = "The full name must have between 3 and 200 characters.")]
    [SwaggerSchema("Full name.")]
    [SchemaExample("Maria Souza Lima")]
    public string? FullName { get; set; }

    [MinimumAge(18, ErrorMessage = "You must be at least 18 years old.")]
    [SwaggerSchema("Birth date; the user must be at least 18.")]
    [SchemaExample("1999-05-14")]
    public DateOnly? BirthDate { get; set; }

    [MaxLength(11)]
    [SwaggerSchema("Contact phone with area code, digits only; saved together with the contact e-mail.")]
    [SchemaExample("15988887777")]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Invalid e-mail.")]
    [MaxLength(150)]
    [SwaggerSchema("Contact e-mail; saved together with the phone.")]
    [SchemaExample("maria.souza@gmail.com")]
    public string? ContactEmail { get; set; }

    [DisplayFormat(ConvertEmptyStringToNull = false)]
    [MaxLength(100, ErrorMessage = "The neighborhood and city must have at most 100 characters.")]
    [SwaggerSchema("Neighborhood and city; an empty text clears them.")]
    [SchemaExample("Campolim, Sorocaba")]
    public string? Neighborhood { get; set; }

    [ValidImage]
    [SwaggerSchema("New profile photo: JPEG, PNG or WebP.")]
    public IFormFile? Image { get; set; }
}
