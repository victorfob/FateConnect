namespace FateConnect.Api.Modules.Users.DTOs;

using System;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;

public class UpdateUserDto
{
    [StringLength(200, MinimumLength = 3, ErrorMessage = "O nome completo deve ter entre 3 e 200 caracteres.")]
    [SwaggerSchema("Full name.")]
    [SchemaExample("Maria Souza Lima")]
    public string? FullName { get; set; }

    [MinimumAge(18, ErrorMessage = "É necessário ter pelo menos 18 anos")]
    [SwaggerSchema("Birth date; the user must be at least 18.")]
    [SchemaExample("1999-05-14T00:00:00Z")]
    public DateTime? BirthDate { get; set; }

    [EnumDataType(typeof(EnumGender), ErrorMessage = "Gênero inválido")]
    [SwaggerSchema("Gender of the user.")]
    [SchemaExample("Female")]
    public EnumGender? Gender { get; set; }

    [MaxLength(11)]
    [SwaggerSchema("Contact phone with area code, digits only; saved together with the contact e-mail.")]
    [SchemaExample("15988887777")]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [MaxLength(150)]
    [SwaggerSchema("Contact e-mail; saved together with the phone.")]
    [SchemaExample("maria.souza@gmail.com")]
    public string? ContactEmail { get; set; }

    [DisplayFormat(ConvertEmptyStringToNull = false)]
    [MaxLength(100, ErrorMessage = "O bairro e a cidade podem ter no máximo 100 caracteres.")]
    [SwaggerSchema("Neighborhood and city; an empty text clears them.")]
    [SchemaExample("Campolim, Sorocaba")]
    public string? Neighborhood { get; set; }

    [ValidImage]
    [SwaggerSchema("New profile photo: JPEG, PNG or WebP.")]
    public IFormFile? Image { get; set; }
}
