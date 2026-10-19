namespace FateConnect.Api.Modules.Reports.Entities;

using System;
using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.Reports.Exceptions;
using FateConnect.Api.Modules.Users.Entities;

public class Report
{
    public Guid Id { get; private set; }
    public EnumReportCategory Category { get; private set; }
    public string Description { get; private set; } = default!;
    public string? ImageUrl { get; private set; }
    public int UserId { get; private set; }
    public User User { get; private set; } = null!;
    public bool IsConfidential { get; private set; }
    public EnumReportStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    protected Report() { }

    public Report(
        EnumReportCategory category,
        string description,
        int userId,
        bool isConfidential,
        DateTime now)
    {
        ValidateCategory(category);
        ValidateDescription(description);
        ValidateUser(userId);

        Id = Guid.NewGuid();
        UserId = userId;
        Category = category;
        Description = description.Trim();
        IsConfidential = isConfidential;
        Status = EnumReportStatus.Open;
        CreatedAt = now;
        UpdatedAt = null;
    }

    public void UpdateStatus(EnumReportStatus newStatus, DateTime now)
    {
        ValidateStatus(newStatus);
        ValidateTransition(Status, newStatus);

        Status = newStatus;
        UpdatedAt = now;
    }

    public void AttachImage(string imageUrl) => ImageUrl = imageUrl.Trim();

    public bool IsReportedBy(int userId) => UserId == userId;

    private static void ValidateTransition(EnumReportStatus currentStatus, EnumReportStatus newStatus)
    {
        bool isValidTransition = (currentStatus, newStatus) switch
        {
            (EnumReportStatus.Open, EnumReportStatus.InReview) => true,
            (EnumReportStatus.Open, EnumReportStatus.Dismissed) => true,
            (EnumReportStatus.InReview, EnumReportStatus.Resolved) => true,
            (EnumReportStatus.InReview, EnumReportStatus.Dismissed) => true,

            _ => false
        };

        if (!isValidTransition)
            throw new InvalidReportStatusTransitionException(currentStatus, newStatus);
    }

    private static void ValidateDescription(string? description)
    {
        bool isInvalid = string.IsNullOrWhiteSpace(description) || description.Trim().Length < 10;

        if (isInvalid)
            throw new InvalidReportDescriptionException();
    }

    private static void ValidateUser(int userId)
    {
        if (userId < 1)
            throw new InvalidUserIdentifierException();
    }

    private static void ValidateCategory(EnumReportCategory category)
    {
        if (!Enum.IsDefined(category))
            throw new InvalidReportCategoryException();
    }

    private static void ValidateStatus(EnumReportStatus status)
    {
        if (!Enum.IsDefined(status))
            throw new InvalidReportStatusException();
    }
}
