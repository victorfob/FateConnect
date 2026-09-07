namespace FateConnect.Api.Modules.LostAndFound.Entities;

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
    public DateOnly OcurredOn { get; private set; }
    public string Description { get; private set; } = default!;
    public string? ImageUrl { get; private set; }
    public EnumStatusLostAndFound Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public int UserId { get; private set; }
    public User User { get; private set; } = null!;

    private LostAndFoundRecord() { }

    public LostAndFoundRecord(
        string name,
        EnumLostAndFoundType lostAndFoundType,
        string place,
        DateOnly ocurredOn,
        string description,
        int userId,
        EnumStatusLostAndFound initialStatus,
        string? imageUrl = null)
    {
        ValidateName(name);
        ValidatePlace(place);
        ValidateOcurredOn(ocurredOn);
        ValidateType(lostAndFoundType);
        ValidateDescription(description);
        ValidateStatus(initialStatus);
        ValidateUser(userId);

        Id = Guid.NewGuid();
        UserId = userId;
        Name = name.Trim();
        LostAndFoundType = lostAndFoundType;
        Place = place.Trim();
        OcurredOn = ocurredOn;
        Description = description.Trim();
        ImageUrl = imageUrl?.Trim();
        Status = initialStatus;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = null;
    }

    public void UpdateBasicAttributes(
        string? name,
        EnumLostAndFoundType? lostAndFoundType,
        string? place,
        DateOnly? ocurredOn,
        string? description,
        EnumStatusLostAndFound? status,
        string? imageUrl)
    {
        if (name is not null)
        {
            ValidateName(name);
            Name = name.Trim();
        }

        if (lostAndFoundType.HasValue)
        {
            ValidateType(lostAndFoundType.Value);
            LostAndFoundType = lostAndFoundType.Value;
        }

        if (place is not null)
        {
            ValidatePlace(place);
            Place = place.Trim();
        }

        if (ocurredOn.HasValue)
        {
            ValidateOcurredOn(ocurredOn.Value);
            OcurredOn = ocurredOn.Value;
        }

        if (description is not null)
        {
            ValidateDescription(description);
            Description = description.Trim();
        }

        if (status.HasValue)
        {
            ValidateStatus(status.Value);
            Status = status.Value;
        }

        if (imageUrl is not null)
        {
            ImageUrl = imageUrl.Trim();
        }

        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsDeleted()
    {
        Status = EnumStatusLostAndFound.Deleted;
        UpdatedAt = DateTime.UtcNow;

    }

    public bool IsReportedBy(int userId) => UserId == userId;

    private static void ValidateUser(int userId)
    {
        if (userId < 1)
            throw new InvalidReporterException();
    }

    private static void ValidateType(EnumLostAndFoundType type)
    {
        if (!Enum.IsDefined(type))
            throw new InvalidLostAndFoundTypeException();
    }

    private static void ValidateStatus(EnumStatusLostAndFound status)
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

    private static void ValidateDescription(string? description)
    {
        bool isInvalidDescription = string.IsNullOrWhiteSpace(description) || description.Trim().Length < 5;

        if (isInvalidDescription)
            throw new InvalidLostAndFoundDescriptionException();
    }

    private static void ValidateOcurredOn(DateOnly date)
    {
        DateOnly todayInProductTimeZone = DateOnly.FromDateTime(DateTimeUtils.NowInProductTimeZone());

        if (date > todayInProductTimeZone)
            throw new InvalidOccurrenceDateException();
    }
}
