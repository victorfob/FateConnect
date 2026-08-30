using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
namespace FateConnect.Api.Modules.Users.DTOs;

public class CreateAddressDto
{
    [Required(ErrorMessage = "O CEP e obrigatório")]
    [MaxLength(9)]
    [DefaultValue("18013-280")]
    public string ZipCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "O logradouro e obrigatório")]
    [MaxLength(200)]
    [DefaultValue("Avenida Engenheiro Carlos Reinaldo Mendes")]
    public string Street { get; set; } = string.Empty;

    [Required(ErrorMessage = "O número e obrigatório")]
    [MaxLength(20)]
    [DefaultValue("2015")]
    public string StreetNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    [DefaultValue("Predio Principal")]
    public string Complement { get; set; } = string.Empty;

    [Required(ErrorMessage = "A cidade e obrigatória")]
    [MaxLength(100)]
    [DefaultValue("Sorocaba")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "O estado e obrigatório")]
    [MaxLength(2)]
    [DefaultValue("SP")]
    public string State { get; set; } = string.Empty;
}
