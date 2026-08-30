using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
namespace FateConnect.Api.Modules.Users.DTOs;

public class CreateAddressDto
{
    [Required(ErrorMessage = "Informe o CEP")]
    [MaxLength(9)]
    [DefaultValue("18013-280")]
    public string ZipCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o logradouro")]
    [MaxLength(200)]
    [DefaultValue("Avenida Engenheiro Carlos Reinaldo Mendes")]
    public string Street { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o número")]
    [MaxLength(20)]
    [DefaultValue("2015")]
    public string StreetNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    [DefaultValue("Predio Principal")]
    public string Complement { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a cidade")]
    [MaxLength(100)]
    [DefaultValue("Sorocaba")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Selecione o estado")]
    [MaxLength(2)]
    [DefaultValue("SP")]
    public string State { get; set; } = string.Empty;
}
