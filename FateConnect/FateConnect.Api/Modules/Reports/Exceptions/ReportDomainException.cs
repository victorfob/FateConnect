namespace FateConnect.Api.Modules.Reports.Exceptions;

using System;
using FateConnect.Api.Modules.Reports.Enums;

public abstract class ReportDomainException(string message) : Exception(message);

public class InvalidReportDescriptionException()
    : ReportDomainException(
        "The report description must have at least 10 characters to give enough context.");

public class InvalidReportCategoryException()
    : ReportDomainException("The report category is invalid.");

public class InvalidReportStatusException()
    : ReportDomainException("The report status is invalid.");

public class ReportNotReportedByUserException()
    : Exception("This report was sent by someone else. Only who sent it can see its photo.");

public class InvalidReportStatusTransitionException(
    EnumReportStatus currentStatus,
    EnumReportStatus newStatus)
    : ReportDomainException(
        currentStatus == newStatus
            ? $"The report is already in the status '{currentStatus}'."
            : $"Invalid transition: the status cannot change from '{currentStatus}' to '{newStatus}'.")
{
}
