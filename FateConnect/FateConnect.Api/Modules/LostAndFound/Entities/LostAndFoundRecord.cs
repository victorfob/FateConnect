namespace FateConnect.Api.Modules.LostAndFound.Entities;

using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Exceptions;
using FateConnect.Api.Modules.Users.Entities;

public class LostAndFoundRecord
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = default!;
    public EnumLostAndFoundType LostAndFoundType { get; private set; }
    public string Place { get; private set; } = default!;
    public DateOnly OccurredOn { get; private set; }
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public EnumLostAndFoundStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? StatusChangedAt { get; private set; }
    public int UserId { get; private set; }
    public User User { get; private set; } = null!;
    public EnumDeletionReason? DeletionReason { get; private set; }

    private LostAndFoundRecord() { }

    public LostAndFoundRecord(
        string name,
        EnumLostAndFoundType lostAndFoundType,
        string place,
        DateOnly occurredOn,
        string? description,
        int userId,
        DateTime now)
    {
        ValidateName(name);
        ValidatePlace(place);
        ValidateOccurredOn(occurredOn, now);
        ValidateType(lostAndFoundType);
        ValidateUser(userId);

        Id = Guid.NewGuid();
        UserId = userId;
        Name = name.Trim();
        LostAndFoundType = lostAndFoundType;
        Place = place.Trim();
        OccurredOn = occurredOn;
        Description = description.NormalizeOptionalText();
        Status = EnumLostAndFoundStatus.Open;
        CreatedAt = now;
        UpdatedAt = null;
    }

    public void UpdateBasicAttributes(
        string? name,
        EnumLostAndFoundType? lostAndFoundType,
        string? place,
        DateOnly? occurredOn,
        string? description,
        EnumLostAndFoundStatus? status,
        DateTime now)
    {
        bool receivedAnyField = false;

        if (name is not null)
        {
            ValidateName(name);
            Name = name.Trim();
            receivedAnyField = true;
        }

        if (lostAndFoundType.HasValue)
        {
            ValidateType(lostAndFoundType.Value);
            LostAndFoundType = lostAndFoundType.Value;
            receivedAnyField = true;
        }

        if (place is not null)
        {
            ValidatePlace(place);
            Place = place.Trim();
            receivedAnyField = true;
        }

        if (occurredOn.HasValue)
        {
            ValidateOccurredOn(occurredOn.Value, now);
            OccurredOn = occurredOn.Value;
            receivedAnyField = true;
        }

        if (description is not null)
        {
            Description = description.NormalizeOptionalText();
            receivedAnyField = true;
        }

        if (status.HasValue)
        {
            ValidateStatus(status.Value);
            ApplyStatus(status.Value, now);
            receivedAnyField = true;
        }

        if (receivedAnyField)
            UpdatedAt = now;
    }

    public void AttachImage(string imageUrl) => ImageUrl = imageUrl.Trim();

    public void DetachImage() => ImageUrl = null;

    public void MarkAsDeleted(EnumDeletionReason reason, DateTime now)
    {
        Status = EnumLostAndFoundStatus.Deleted;
        DeletionReason = reason;
        StatusChangedAt = now;
        UpdatedAt = now;
    }

    public bool IsReportedBy(int userId) => UserId == userId;

    public bool IsDeleted => Status == EnumLostAndFoundStatus.Deleted;

    private void ApplyStatus(EnumLostAndFoundStatus status, DateTime now)
    {
        if (status == EnumLostAndFoundStatus.Deleted)
        {
            MarkAsDeleted(EnumDeletionReason.User, now);
            return;
        }

        Status = status;
        DeletionReason = null;
        StatusChangedAt = StampFor(status, now);
    }

    private static DateTime? StampFor(EnumLostAndFoundStatus status, DateTime now)
    {
        if (status == EnumLostAndFoundStatus.Resolved)
            return now;

        return null;
    }

    private static void ValidateUser(int userId)
    {
        if (userId < 1)
            throw new InvalidUserIdentifierException();
    }

    private static void ValidateType(EnumLostAndFoundType type)
    {
        if (!Enum.IsDefined(type))
            throw new InvalidLostAndFoundTypeException();
    }

    private static void ValidateStatus(EnumLostAndFoundStatus status)
    {
        if (!Enum.IsDefined(status))
            throw new InvalidLostAndFoundStatusException();
    }

    private static void ValidateName(string? name)
    {
        bool isInvalidName = string.IsNullOrWhiteSpace(name) || name.Trim().Length < 3;

        if (isInvalidName)
            throw new InvalidLostAndFoundNameException();
    }

    private static void ValidatePlace(string? place)
    {
        bool isInvalidPlace = string.IsNullOrWhiteSpace(place) || place.Trim().Length < 3;

        if (isInvalidPlace)
            throw new InvalidLostAndFoundPlaceException();
    }

    private static void ValidateOccurredOn(DateOnly date, DateTime now)
    {
        if (date == default)
            throw new MissingOccurrenceDateException();

        DateOnly todayInProductTimeZone = DateOnly.FromDateTime(DateTimeUtils.InProductTimeZone(now));

        if (date > todayInProductTimeZone)
            throw new InvalidOccurrenceDateException();
    }
}
