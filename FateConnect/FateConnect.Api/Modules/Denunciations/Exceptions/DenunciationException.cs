namespace FateConnect.Api.Modules.Denunciations.Exceptions;

using System;
using FateConnect.Api.Modules.Denunciations.Enums;

public abstract class DenunciationDomainException(string message) : Exception(message);

public class InvalidDenunciationDescriptionException()
    : DenunciationDomainException("A descrição da denúncia deve conter pelo menos 10 caracteres para fornecer contexto suficiente.");

public class InvalidDenunciationCategoryException()
    : DenunciationDomainException("A categoria selecionada para a denúncia é inválida ou não existe no sistema.");

public class InvalidDenunciationStatusException()
    : DenunciationDomainException("O status informado para a denúncia é inválido.");

public class InvalidDenunciationStatusTransitionException(EnumDenunciationStatus currentStatus, EnumDenunciationStatus newStatus)
    : DenunciationDomainException(
        currentStatus == newStatus
            ? $"A denúncia já se encontra no status '{currentStatus}'."
            : $"Transição inválida: não é possível alterar o status de '{currentStatus}' para '{newStatus}'.")
{
}
