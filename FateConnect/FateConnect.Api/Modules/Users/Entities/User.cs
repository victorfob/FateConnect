namespace FateConnect.Api.Modules.Users.Entities;

using System;
using System.Collections.Generic;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Auth.Utils;
using FateConnect.Api.Modules.Common.Constants;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;

public class User
{
    public int Id { get; init; }
    public string FatecEmail { get; private set; } = string.Empty;
    public string Password { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public DateTime BirthDate { get; private set; }
    public EnumGender Gender { get; private set; }

    public string? Phone { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? Neighborhood { get; private set; }
    public string? ImageUrl { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public EnumProfileType ProfileType { get; private set; }
    public EnumAccountStatus Status { get; private set; }
    public int TokenVersion { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockedUntil { get; private set; }

    public bool IsEmailConfirmed { get; private set; }

    private readonly List<UserToken> _tokens = [];
    public IReadOnlyCollection<UserToken> Tokens => _tokens.AsReadOnly();

    public UserPreferences Preferences { get; private set; } = null!;

    public bool HasContact => Phone is not null && ContactEmail is not null;

    private readonly List<DocumentAcceptance> _documentAcceptances = [];
    public IReadOnlyCollection<DocumentAcceptance> DocumentAcceptances => _documentAcceptances.AsReadOnly();

    protected User() { }

    public User(
        string fatecEmail,
        string passwordHash,
        string fullName,
        DateTime birthDate,
        EnumGender gender,
        UserContact? contact,
        DateTime createdAt)
    {
        ValidateEmail(fatecEmail);
        ValidateFullName(fullName);
        ValidateGender(gender);

        FatecEmail = fatecEmail.Trim().ToLowerInvariant();
        Password = passwordHash;
        FullName = fullName.Trim();
        BirthDate = birthDate;
        Gender = gender;

        ReplaceContact(contact);

        ProfileType = EnumProfileType.Operator;
        Status = EnumAccountStatus.Active;
        TokenVersion = 0;
        IsEmailConfirmed = false;
        CreatedAt = createdAt;
        UpdatedAt = null;
        FailedLoginAttempts = 0;
        LockedUntil = null;
    }

    public void UpdatePersonalData(
        string fullName,
        DateTime birthDate,
        EnumGender gender,
        UserContact? contact,
        string? neighborhood,
        DateTime now)
    {
        ValidateFullName(fullName);
        ValidateGender(gender);
        ValidateNeighborhood(neighborhood);

        FullName = fullName.Trim();
        BirthDate = birthDate;
        Gender = gender;
        ReplaceContact(contact);
        Neighborhood = neighborhood.NormalizeOptionalText();

        RegisterUpdate(now);
    }

    public void AttachImage(string imageUrl, DateTime now)
    {
        ImageUrl = imageUrl.Trim();
        RegisterUpdate(now);
    }

    public void RemoveImage(DateTime now)
    {
        ImageUrl = null;
        RegisterUpdate(now);
    }

    public void ChangePassword(string newPasswordHash, DateTime now)
    {
        Password = newPasswordHash;
        RegisterUpdate(now);
        IncrementTokenVersion(now);
    }

    public void Deactivate(DateTime now)
    {
        if (Status == EnumAccountStatus.SelfDeactivated)
            return;

        Status = EnumAccountStatus.SelfDeactivated;
        IncrementTokenVersion(now);
    }

    public void UpdateByAdmin(
        string fullName,
        string fatecEmail,
        UserContact? contact,
        DateTime now)
    {
        ValidateFullName(fullName);
        ValidateEmail(fatecEmail);

        FullName = fullName.Trim();
        FatecEmail = fatecEmail.Trim().ToLowerInvariant();
        ReplaceContact(contact);

        RegisterUpdate(now);
    }

    public void PromoteToAdministrator(DateTime now)
    {
        if (ProfileType == EnumProfileType.Administrator)
            return;

        ProfileType = EnumProfileType.Administrator;
        IncrementTokenVersion(now);
    }

    public void DemoteToOperator(DateTime now)
    {
        if (ProfileType == EnumProfileType.Operator)
            return;

        ProfileType = EnumProfileType.Operator;
        IncrementTokenVersion(now);
    }

    public void Ban(DateTime now)
    {
        if (Status == EnumAccountStatus.Banned)
            return;

        Status = EnumAccountStatus.Banned;
        IncrementTokenVersion(now);
    }

    public void ReactivateFromBan(DateTime now)
    {
        if (Status != EnumAccountStatus.Banned)
            return;

        Status = EnumAccountStatus.Active;
        RegisterUpdate(now);
    }

    public void SetPreferences(UserPreferences preferences)
    {
        ArgumentNullException.ThrowIfNull(preferences);
        Preferences = preferences;
    }

    public void AddDocumentAcceptance(DocumentAcceptance acceptance, DateTime now)
    {
        ArgumentNullException.ThrowIfNull(acceptance);
        _documentAcceptances.Add(acceptance);
    }

    private void ReplaceContact(UserContact? contact)
    {
        if (contact is null)
            return;

        Phone = contact.Phone.Trim();
        ContactEmail = contact.ContactEmail.Trim().ToLowerInvariant();
    }

    private void IncrementTokenVersion(DateTime now)
    {
        TokenVersion++;
        RegisterUpdate(now);
    }

    private void RegisterUpdate(DateTime now) => UpdatedAt = now;

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

        if (isNullOrEmpty)
            throw new InvalidFatecEmailDomainException();

        bool isInvalidDomain = !RegexConstants.DomainRegex().IsMatch(email);

        if (isInvalidDomain)
            throw new InvalidFatecEmailDomainException();

        bool isInvalidLocalPart = !RegexConstants.LocalPartRegex().IsMatch(email);

        if (isInvalidLocalPart)
            throw new InvalidFatecEmailLocalPartException();
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

    public void ConfirmEmail(DateTime now)
    {
        if (IsEmailConfirmed)
            return;

        IsEmailConfirmed = true;
        RegisterUpdate(now);
    }

    public bool IsLocked(DateTime now) => LockedUntil.HasValue && LockedUntil.Value > now;

    public void RegisterFailedLoginAttempt(DateTime now)
    {
        if (LockedUntil.HasValue && LockedUntil.Value <= now)
        {
            FailedLoginAttempts = 0;
            LockedUntil = null;
        }

        FailedLoginAttempts++;

        if (FailedLoginAttempts >= AuthConstants.MaxFailedLoginAttempts)
        {
            LockedUntil = now.AddMinutes(AuthConstants.LockoutMinutes);
        }

        RegisterUpdate(now);
    }

    public void ResetFailedLoginAttempts(DateTime now)
    {
        if (FailedLoginAttempts == 0 && LockedUntil is null)
            return;

        FailedLoginAttempts = 0;
        LockedUntil = null;

        RegisterUpdate(now);
    }

    public string IssueToken(EnumTokenType type, DateTime now, TimeSpan lifetime)
    {
        string rawToken = TokenHelper.GenerateRawToken();
        string tokenHash = TokenHelper.HashToken(rawToken);

        var token = new UserToken(
            userId: Id,
            token: tokenHash,
            type: type,
            createdAt: now,
            expiresAt: now.Add(lifetime)
        );

        _tokens.Add(token);

        return rawToken;
    }
}
