namespace FateConnect.Api.Modules.Reports.Exceptions;

using System;
using FateConnect.Api.Modules.Reports.Enums;

public abstract class ReportDomainException(string message) : Exception(message);

public class InvalidReportDescriptionException()
    : ReportDomainException(
        "A descrição da denúncia deve conter pelo menos 10 caracteres para fornecer contexto suficiente.");

public class InvalidReportCategoryException()
    : ReportDomainException("A categoria selecionada para a denúncia é inválida ou não existe no sistema.");

public class InvalidReportStatusException()
    : ReportDomainException("O status informado para a denúncia é inválido.");

public class ReportNotReportedByUserException()
    : Exception("Esta denúncia foi registrada por outra pessoa. Só quem a registrou pode ver o anexo dela.");

public class InvalidReportStatusTransitionException(
    EnumReportStatus currentStatus,
    EnumReportStatus newStatus)
    : ReportDomainException(
        currentStatus == newStatus
            ? $"A denúncia já se encontra no status '{currentStatus}'."
            : $"Transição inválida: não é possível alterar o status de '{currentStatus}' para '{newStatus}'.")
{
}
