namespace FateConnect.Api.Modules.Users.Entities;

using FateConnect.Api.Modules.Common.Constants;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
public class User
{
    public int Id { get; init; }
    public string FatecEmail { get; private set; } = string.Empty;
    public string Password { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public DateTime BirthDate { get; private set; }
    public EnumGender Gender { get; private set; }

    public string Phone { get; private set; } = string.Empty;
    public string ContactEmail { get; private set; } = string.Empty;
    public string? Neighborhood { get; private set; }
    public string? ImageUrl { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public EnumProfileType ProfileType { get; private set; }
    public EnumAccountStatus Status { get; private set; }
    public int TokenVersion { get; private set; }

    public UserPreferences Preferences { get; private set; } = null!;

    private readonly List<DocumentAcceptance> _documentAcceptances = [];
    public IReadOnlyCollection<DocumentAcceptance> DocumentAcceptances => _documentAcceptances.AsReadOnly();

    protected User() { }

    public User(
        string fatecEmail,
        string passwordHash,
        string fullName,
        DateTime birthDate,
        EnumGender gender,
        string phone,
        string contactEmail,
        string? neighborhood)
    {
        ValidateEmail(fatecEmail);
        ValidateFullName(fullName);
        ValidateBirthDate(birthDate);
        ValidateGender(gender);
        ValidateNeighborhood(neighborhood);

        FatecEmail = fatecEmail.Trim().ToLowerInvariant();
        Password = passwordHash;
        FullName = fullName.Trim();
        BirthDate = birthDate;
        Gender = gender;

        Phone = phone.Trim();
        ContactEmail = contactEmail.Trim().ToLowerInvariant();
        Neighborhood = neighborhood.NormalizeOptionalText();

        ProfileType = EnumProfileType.Operator;
        Status = EnumAccountStatus.Active;
        TokenVersion = 1;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = null;
    }

    public void UpdatePersonalData(
        string fullName,
        DateTime birthDate,
        EnumGender gender,
        string phone,
        string contactEmail,
        string? neighborhood)
    {
        ValidateFullName(fullName);
        ValidateBirthDate(birthDate);
        ValidateGender(gender);
        ValidateNeighborhood(neighborhood);

        FullName = fullName.Trim();
        BirthDate = birthDate;
        Gender = gender;
        Phone = phone.Trim();
        ContactEmail = contactEmail.Trim().ToLowerInvariant();
        Neighborhood = neighborhood.NormalizeOptionalText();

        RegisterUpdate();
    }

    public void AttachImage(string imageUrl)
    {
        ImageUrl = imageUrl.Trim();
        RegisterUpdate();
    }

    public void ChangePassword(string newPasswordHash)
    {
        Password = newPasswordHash;
        RegisterUpdate();
        IncrementTokenVersion();
    }

    public void Deactivate()
    {
        if (Status == EnumAccountStatus.SelfDeactivated)
            return;

        Status = EnumAccountStatus.SelfDeactivated;
        IncrementTokenVersion();
    }

    public void UpdateByAdmin(
        string fullName,
        string fatecEmail,
        string phone,
        string contactEmail)
    {
        ValidateFullName(fullName);
        ValidateEmail(fatecEmail);

        FullName = fullName.Trim();
        FatecEmail = fatecEmail.Trim().ToLowerInvariant();
        Phone = phone.Trim();
        ContactEmail = contactEmail.Trim().ToLowerInvariant();

        RegisterUpdate();
    }

    public void PromoteToAdministrator()
    {
        if (ProfileType == EnumProfileType.Administrator)
            return;

        ProfileType = EnumProfileType.Administrator;
        IncrementTokenVersion();
    }

    public void DemoteToOperator()
    {
        if (ProfileType == EnumProfileType.Operator)
            return;

        ProfileType = EnumProfileType.Operator;
        IncrementTokenVersion();
    }

    public void Ban()
    {
        if (Status == EnumAccountStatus.Banned)
            return;

        Status = EnumAccountStatus.Banned;
        IncrementTokenVersion();
    }

    public void ReactivateFromBan()
    {
        if (Status != EnumAccountStatus.Banned)
            return;

        Status = EnumAccountStatus.Active;
        RegisterUpdate();
    }

    public void SetPreferences(UserPreferences preferences)
    {
        ArgumentNullException.ThrowIfNull(preferences);
        Preferences = preferences;
    }

    public void AddDocumentAcceptance(DocumentAcceptance acceptance)
    {
        ArgumentNullException.ThrowIfNull(acceptance);
        _documentAcceptances.Add(acceptance);
    }

    private void IncrementTokenVersion()
    {
        TokenVersion++;
        RegisterUpdate();
    }

    private void RegisterUpdate() => UpdatedAt = DateTime.UtcNow;

    private static void ValidateFullName(string name)
    {
        bool isNullOrEmpty = string.IsNullOrWhiteSpace(name);
        bool isTooShort = !isNullOrEmpty && name.Trim().Length < 3;
        bool isTooLong = !isNullOrEmpty && name.Trim().Length > 200;

        if (isNullOrEmpty || isTooShort || isTooLong)
            throw new InvalidUserFullNameException();
    }

    private static void ValidateEmail(string email)
    {
        bool isNullOrEmpty = string.IsNullOrWhiteSpace(email);

        bool isInvalidDomain = !isNullOrEmpty && !Regex.IsMatch(
            email,
            RegexConstants.FatecEmailDomainPattern,
            RegexOptions.None,
            TimeSpan.FromMilliseconds(250));

        if (isNullOrEmpty || isInvalidDomain)
            throw new InvalidFatecEmailDomainException();
    }

    private static void ValidateBirthDate(DateTime birthDate)
    {
        DateTime today = DateTimeUtils.NowInProductTimeZone().Date;
        int age = today.Year - birthDate.Year;

        bool hasNotHadBirthdayThisYear = birthDate.Date > today.AddYears(-age);

        if (hasNotHadBirthdayThisYear)
            age--;

        bool isUnderage = age < 18;

        if (isUnderage)
            throw new UnderageUserException();
    }

    private static void ValidateGender(EnumGender gender)
    {
        if (!Enum.IsDefined(gender))
            throw new InvalidGenderException();
    }

    private static void ValidateNeighborhood(string? neighborhood)
    {
        bool hasValue = !string.IsNullOrWhiteSpace(neighborhood);
        bool isTooLong = hasValue && neighborhood!.Trim().Length > 100;

        if (isTooLong)
            throw new InvalidNeighborhoodException();
    }
}
