namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

public class UpdateUserDto
{
    [MaxLength(200)]
    public string? FullName { get; set; }

    [MinimumAge(18, ErrorMessage = "É necessário ter pelo menos 18 anos")]
    public DateTime? BirthDate { get; set; }

    [EnumDataType(typeof(EnumGender), ErrorMessage = "Gênero inválido")]
    public EnumGender? Gender { get; set; }

    [MaxLength(11)]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [MaxLength(150)]
    public string? ContactEmail { get; set; }

    [MaxLength(100, ErrorMessage = "O bairro deve ter no máximo 100 caracteres")]
    public string? Neighborhood { get; set; }

    public IFormFile? Image { get; set; }
}
