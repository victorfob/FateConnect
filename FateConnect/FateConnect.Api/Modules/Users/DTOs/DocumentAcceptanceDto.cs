using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Users.Enums;

namespace FateConnect.Api.Modules.Users.DTOs;

public class DocumentAcceptanceDto
{
    [Required]
    [DefaultValue(1)]
    [EnumDataType(typeof(EnumDocumentType), ErrorMessage = "Documento inválido")]
    required public EnumDocumentType Document { get; set; }

    [Required(ErrorMessage = "Informe a versão do documento aceito")]
    [MaxLength(20)]
    [DefaultValue("2026-08-27")]
    required public string Version { get; set; }
}
