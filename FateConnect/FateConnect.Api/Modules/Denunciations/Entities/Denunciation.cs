namespace FateConnect.Api.Modules.Denunciations.Entities;

using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Denunciations.Exceptions;
using FateConnect.Api.Modules.Users.Entities;
using System;

public class Denunciation
{
    public Guid Id { get; private set; }
    public EnumDenunciationCategory Category { get; private set; }
    public string Description { get; private set; } = default!;
    public string? ImageUrl { get; private set; }
    public int UserId { get; private set; }
    public User User { get; private set; } = null!;
    public bool IsAnonymous { get; private set; }
    public EnumDenunciationStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    protected Denunciation() { }

    public Denunciation(
        EnumDenunciationCategory category,
        string description,
        int userId,
        bool isAnonymous,
        string? imageUrl = null)
    {
        ValidateCategory(category);
        ValidateDescription(description);
        ValidateUser(userId);

        Id = Guid.NewGuid();
        UserId = userId;
        Category = category;
        Description = description.Trim();
        IsAnonymous = isAnonymous;
        ImageUrl = imageUrl?.Trim();
        Status = EnumDenunciationStatus.Open;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = null;
    }

    public void UpdateStatus(EnumDenunciationStatus newStatus)
    {
        ValidateStatus(newStatus);

        Status = newStatus;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AttachImage(string imageUrl) => ImageUrl = imageUrl.Trim();

    public bool IsReportedBy(int userId) => UserId == userId;

    private static void ValidateDescription(string? description)
    {
        bool isInvalid = string.IsNullOrWhiteSpace(description) || description.Trim().Length < 10;

        if (isInvalid)
            throw new InvalidDenunciationDescriptionException();
    }

    private static void ValidateUser(int userId)
    {
        if (userId < 1)
            throw new InvalidUserIdentifierException();
    }

    private static void ValidateCategory(EnumDenunciationCategory category)
    {
        if (!Enum.IsDefined(category))
            throw new InvalidDenunciationCategoryException();
    }

    private static void ValidateStatus(EnumDenunciationStatus status)
    {
        if (!Enum.IsDefined(status))
            throw new InvalidDenunciationStatusException();
    }
}
