using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Auth.Options;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Emails.Interfaces;
using FateConnect.Api.Modules.Reports.Entities;
using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Workers;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using MassTransit;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.Testing;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using static BCrypt.Net.BCrypt;

namespace FateConnect.Api.Tests.Fixtures;

public class ApiFactory : WebApplicationFactory<Program>
{
    public const string FakeSecret = "fake-test-secret-with-no-value-outside-this-suite";

    public const string FakeVapidPublicKey = "chave-publica-falsa-desta-suite";

    private readonly string _databaseName = $"fateconnect-tests-{Guid.NewGuid()}";

    private readonly string _webRoot = Path.Combine(Path.GetTempPath(), $"fateconnect-webroot-{Guid.NewGuid():N}");

    private static readonly TimeSpan NotificationTimeout = TimeSpan.FromSeconds(20);
    private static readonly TimeSpan HarnessTimeout = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan HarnessInactivityTimeout = TimeSpan.FromSeconds(10);

    public TimeProvider? Clock { get; init; }

    public ILegalDocumentVersions? DocumentVersions { get; init; }

    public RecordingEmailService Emails { get; } = new();

    public RecordingPushSender Pushes { get; } = new();

    public IReadOnlyList<FakeLogRecord> LogRecords => Services.GetRequiredService<FakeLogCollector>().GetSnapshot();

    public IReadOnlyList<string> LogMessages => [.. LogRecords.Select(record => record.Message)];

    public ApiFactory()
    {
        Directory.CreateDirectory(_webRoot);

        Environment.SetEnvironmentVariable("DB_CONNECTION", "Host=banco-falso-da-suite;Database=substituido-pela-fabrica");
        Environment.SetEnvironmentVariable("JWT_SECRET", FakeSecret);
        Environment.SetEnvironmentVariable("JWT_ISSUER", "FateConnectTest");
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", "FateConnectTestWeb");
        Environment.SetEnvironmentVariable("PUBLIC_URL", "https://fateconnect.test");
        Environment.SetEnvironmentVariable("EMAIL_SENDER", "nao-responda@fateconnect.test");
        Environment.SetEnvironmentVariable("RESEND_API_KEY", "re_chave_falsa_desta_suite");
        Environment.SetEnvironmentVariable("VAPID_PUBLIC_KEY", FakeVapidPublicKey);
        Environment.SetEnvironmentVariable("VAPID_PRIVATE_KEY", "chave-privada-falsa-desta-suite");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseWebRoot(_webRoot);

        builder.ConfigureServices(services =>
        {
            ServiceDescriptor registration = services.Single(
                service => service.ServiceType == typeof(DbContextOptions<FateConnectDbContext>));

            services.Remove(registration);
            services.AddDbContext<FateConnectDbContext>(
                options => options.UseNpgsql(TestDatabase.ConnectionStringFor(_databaseName)));

            ServiceDescriptor retentionWorker = services.Single(
                service => service.ImplementationType == typeof(LostAndFoundRetentionWorker));

            services.Remove(retentionWorker);

            services.AddMassTransitTestHarness(bus => bus.SetTestTimeouts(HarnessTimeout, HarnessInactivityTimeout));
            services.AddFakeLogging();
            services.RemoveAll<IEmailService>();
            services.AddSingleton<IEmailService>(Emails);
            services.RemoveAll<IPushSender>();
            services.AddSingleton<IPushSender>(Pushes);

            if (DocumentVersions is not null)
            {
                services.RemoveAll<ILegalDocumentVersions>();
                services.AddSingleton(DocumentVersions);
            }

            if (Clock is null)
                return;

            services.RemoveAll<TimeProvider>();
            services.AddSingleton(Clock);
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (!disposing)
            return;

        CloseIdleDatabaseConnections();

        if (Directory.Exists(_webRoot))
            Directory.Delete(_webRoot, recursive: true);
    }

    public void DropDatabase()
    {
        CloseIdleDatabaseConnections();

        using NpgsqlConnection connection = new(TestDatabase.ConnectionStringFor("postgres"));
        connection.Open();

        using NpgsqlCommand command = new($"DROP DATABASE \"{_databaseName}\" WITH (FORCE)", connection);
        command.ExecuteNonQuery();
    }

    private void CloseIdleDatabaseConnections()
    {
        using NpgsqlConnection connection = new(TestDatabase.ConnectionStringFor(_databaseName));
        NpgsqlConnection.ClearPool(connection);
    }

    public static string IssueToken(
        int userId = 1,
        int tokenVersion = 0,
        EnumProfileType profileType = EnumProfileType.Operator)
    {
        JwtOptions options = new()
        {
            Secret = FakeSecret,
            Issuer = "FateConnectTest",
            Audience = "FateConnectTestWeb",
        };

        User user = new User(
            fatecEmail: "mariana.rocha@aluno.cps.sp.gov.br",
            passwordHash: "hash-sem-valor",
            fullName: "Mariana Rocha",
            birthDate: new DateOnly(2000, 1, 1),
            gender: EnumGender.Female,
            contact: new UserContact("11999999999", "mariana.contato@gmail.com"),
            createdAt: DateTime.UtcNow
        )
        {
            Id = userId
        };

        if (profileType == EnumProfileType.Administrator)
            user.PromoteToAdministrator(DateTime.UtcNow);

        if (tokenVersion != user.TokenVersion)
            typeof(User).GetProperty(nameof(User.TokenVersion))?.SetValue(user, tokenVersion);

        return new TokenService(Options.Create(options), TimeProvider.System).GenerateJwtToken(user);
    }

    public static string IssueTokenWithoutVersion(int userId = 1)
    {
        JwtSecurityTokenHandler handler = new();
        byte[] securityKey = Encoding.UTF8.GetBytes(FakeSecret);

        ClaimsIdentity claims = new(
        [
            new Claim(ClaimTypes.NameIdentifier, userId.ToString(CultureInfo.InvariantCulture)),
            new Claim(ClaimTypes.Name, "Mariana Alves Rocha"),
            new Claim(ClaimTypes.Role, "Operator"),
            new Claim(ClaimTypes.Email, "mariana.rocha@aluno.cps.sp.gov.br")
        ]);

        SecurityToken token = handler.CreateToken(new SecurityTokenDescriptor
        {
            Subject = claims,
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = "FateConnectTest",
            Audience = "FateConnectTestWeb",
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(securityKey),
                SecurityAlgorithms.HmacSha256Signature)
        });

        return handler.WriteToken(token);
    }

    public static string UniquePhone() => $"15{Random.Shared.Next(100_000_000, 999_999_999)}";

    public static string UniqueContactEmail() => $"contato{Guid.NewGuid():N}@gmail.com";

    public SeededUser SeedUser(
        string fullName,
        EnumProfileType profileType = EnumProfileType.Operator,
        string? imageUrl = null)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        string phone = UniquePhone();
        string contactEmail = UniqueContactEmail();

        User user = new User(
            fatecEmail: $"{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            passwordHash: "hash-sem-valor-fora-desta-suite",
            fullName: fullName,
            birthDate: new DateOnly(2000, 1, 1),
            gender: EnumGender.Other,
            contact: new UserContact(phone, contactEmail),
            createdAt: DateTime.UtcNow
        );

        if (imageUrl is not null)
            user.AttachImage(imageUrl, DateTime.UtcNow);

        user.ConfirmEmail(DateTime.UtcNow);
        user.SetPreferences(new UserPreferences(receiveNotifications: false));

        context.Users.Add(user);

        context.Entry(user).Property(u => u.ProfileType).CurrentValue = profileType;
        context.Entry(user).Property(u => u.CreatedAt).CurrentValue = DateTime.UtcNow;
        context.Entry(user).Property(u => u.UpdatedAt).CurrentValue = DateTime.UtcNow;

        context.SaveChanges();

        return new SeededUser(user.Id, phone, contactEmail);
    }

    public int SeedUserWithoutContact(string fullName)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        User user = new User(
            fatecEmail: $"{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            passwordHash: "hash-sem-valor-fora-desta-suite",
            fullName: fullName,
            birthDate: new DateOnly(2000, 1, 1),
            gender: EnumGender.Other,
            contact: null,
            createdAt: DateTime.UtcNow
        );

        user.ConfirmEmail(DateTime.UtcNow);
        user.SetPreferences(new UserPreferences(receiveNotifications: false));

        context.Users.Add(user);
        context.SaveChanges();

        return user.Id;
    }

    public (int Id, string FatecEmail) SeedUserWithPassword(
        string fullName,
        string password,
        EnumAccountStatus status = EnumAccountStatus.Active,
        bool emailConfirmed = true)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        User user = new User(
            fatecEmail: $"{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            passwordHash: HashPassword(password),
            fullName: fullName,
            birthDate: new DateOnly(2000, 1, 1),
            gender: EnumGender.Other,
            contact: new UserContact(UniquePhone(), UniqueContactEmail()),
            createdAt: DateTime.UtcNow
        );

        if (emailConfirmed)
            user.ConfirmEmail(DateTime.UtcNow);

        user.SetPreferences(new UserPreferences(receiveNotifications: false));

        context.Users.Add(user);

        context.Entry(user).Property(u => u.Status).CurrentValue = status;
        context.Entry(user).Property(u => u.CreatedAt).CurrentValue = DateTime.UtcNow;
        context.Entry(user).Property(u => u.UpdatedAt).CurrentValue = DateTime.UtcNow;

        context.SaveChanges();

        return (user.Id, user.FatecEmail);
    }

    public void SeedDocumentAcceptance(int userId, EnumDocumentType document, string version)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        context.DocumentAcceptances.Add(
            new DocumentAcceptance(document, version, DateTime.UtcNow, "198.51.100.23", "Mozilla/5.0") { UserId = userId });
        context.SaveChanges();
    }

    public IReadOnlyList<DocumentAcceptance> DocumentAcceptancesOf(int userId)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        return context.DocumentAcceptances
            .AsNoTracking()
            .Where(acceptance => acceptance.UserId == userId)
            .OrderBy(acceptance => acceptance.Id)
            .ToList();
    }

    public void SetAccountStatus(int userId, EnumAccountStatus status)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        context.Users
            .Where(user => user.Id == userId)
            .ExecuteUpdate(setters => setters.SetProperty(user => user.Status, status));
    }

    public int TokenCountOf(string fatecEmail, EnumTokenType type)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        return context.UserTokens.Count(token => token.User.FatecEmail == fatecEmail && token.Type == type);
    }

    public IReadOnlyList<AdministrativeAction> AdministrativeActionsOn(int targetId)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        return context.AdministrativeActions
            .AsNoTracking()
            .Where(action => action.TargetId == targetId)
            .OrderBy(action => action.Id)
            .ToList();
    }

    public void DeleteUser(int userId)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        context.Users.Where(user => user.Id == userId).ExecuteDelete();
    }

    public Guid SeedRide(
        int driverId,
        DateOnly departureDate,
        TimeOnly departureTime,
        string destination = "Sorocaba centro",
        string? description = null,
        EnumVehicleType vehicleType = EnumVehicleType.Car)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        DateOnly acceptedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));
        Ride ride = new(
            destination,
            new RideFirstDeparture(acceptedDate, departureTime),
            EnumRideType.Solidarity,
            vehicleType,
            driverId,
            DateTime.UtcNow,
            description);

        context.Rides.Add(ride);
        context.Entry(ride).Property(entity => entity.DepartureDate).CurrentValue = departureDate;
        context.Entry(ride).Property(entity => entity.DepartureTime).CurrentValue = departureTime;
        context.SaveChanges();

        context.RideDepartures
            .Where(departure => departure.RideId == ride.Id)
            .ExecuteUpdate(setters => setters.SetProperty(departure => departure.Date, departureDate));

        return ride.Id;
    }

    public Guid SeedLostAndFoundRecord(
        int reporterId,
        EnumLostAndFoundStatus status = EnumLostAndFoundStatus.Open,
        DateTime? createdAt = null,
        DateTime? updatedAt = null,
        DateTime? statusChangedAt = null,
        string? imageUrl = null)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        LostAndFoundRecord record = new(
            "Garrafa térmica azul",
            EnumLostAndFoundType.Lost,
            "Biblioteca do bloco B",
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
            "Ficou na mesa do fundo.",
            reporterId, DateTime.UtcNow);

        if (imageUrl is not null)
            record.AttachImage(imageUrl);

        context.LostAndFoundRecords.Add(record);

        EntityEntry<LostAndFoundRecord> entry = context.Entry(record);
        entry.Property(entity => entity.Status).CurrentValue = status;
        entry.Property(entity => entity.CreatedAt).CurrentValue = createdAt ?? DateTime.UtcNow;
        entry.Property(entity => entity.UpdatedAt).CurrentValue = updatedAt;
        entry.Property(entity => entity.StatusChangedAt).CurrentValue = statusChangedAt;

        context.SaveChanges();

        return record.Id;
    }

    public Guid SeedReport(
        int reporterId,
        string description,
        DateOnly reportedOn,
        EnumReportCategory category = EnumReportCategory.ImproperCharging,
        EnumReportStatus status = EnumReportStatus.Open,
        bool isAnonymous = false)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        Report report = new(category, description, reporterId, isAnonymous, DateTime.UtcNow);

        context.Reports.Add(report);
        context.Entry(report).Property(entity => entity.CreatedAt).CurrentValue =
            DateTimeUtils.ToUtcFromProductTimeZone(reportedOn, new TimeOnly(10, 0));
        context.Entry(report).Property(entity => entity.Status).CurrentValue = status;
        context.SaveChanges();

        return report.Id;
    }

    public void PrepareForNotifications(int userId, string? neighborhood = null, bool receiveNotifications = true)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        context.Users
            .Where(user => user.Id == userId)
            .ExecuteUpdate(setters => setters.SetProperty(user => user.Neighborhood, neighborhood));

        context.UserPreferences
            .Where(preferences => preferences.UserId == userId)
            .ExecuteUpdate(setters => setters.SetProperty(preferences => preferences.ReceiveNotifications, receiveNotifications));
    }

    public int SeedNotification(
        int userId,
        DateTime createdAt,
        EnumInAppNotificationType type = EnumInAppNotificationType.ItemArchived,
        bool isRead = false)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        InAppNotification notification = new(userId, type, "Seu item foi arquivado por inatividade.", Guid.NewGuid().ToString(), createdAt);

        if (isRead)
            notification.MarkAsRead(createdAt);

        context.InAppNotifications.Add(notification);
        context.SaveChanges();

        return notification.Id;
    }

    public void SeedPushSubscription(int userId, string endpoint)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        context.PushSubscriptions.Add(new PushSubscription(userId, endpoint, "chave-p256dh", "segredo-auth", DateTime.UtcNow));
        context.SaveChanges();
    }

    public IReadOnlyList<PushSubscription> PushSubscriptionsOf(int userId)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        return context.PushSubscriptions
            .AsNoTracking()
            .Where(subscription => subscription.UserId == userId)
            .OrderBy(subscription => subscription.Id)
            .ToList();
    }

    public IReadOnlyList<InAppNotification> NotificationsOf(int userId)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        return context.InAppNotifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderBy(notification => notification.Id)
            .ToList();
    }

    public async Task<IReadOnlyList<InAppNotification>> WaitForNotificationsAsync(int userId)
    {
        await WaitUntilAsync(
            () => Task.FromResult(NotificationsOf(userId).Count > 0),
            $"Expected a notification for user {userId}, got none.");

        return NotificationsOf(userId);
    }

    public static async Task WaitUntilAsync(Func<Task<bool>> condition, string failure)
    {
        DateTime deadline = DateTime.UtcNow + NotificationTimeout;

        while (DateTime.UtcNow < deadline)
        {
            if (await condition())
                return;

            await Task.Delay(TimeSpan.FromMilliseconds(100));
        }

        throw new TimeoutException(failure);
    }

    public HttpClient CreateClientFor(
        int userId,
        int tokenVersion = 0,
        EnumProfileType profileType = EnumProfileType.Operator)
    {
        HttpClient client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", IssueToken(userId, tokenVersion, profileType));

        return client;
    }

    public HttpClient CreateClientForNewUser(string fullName)
    {
        return CreateClientFor(SeedUser(fullName).Id);
    }

    public HttpClient CreateClientForNewAdministrator(string fullName)
    {
        int administratorId = SeedUser(fullName, EnumProfileType.Administrator).Id;

        return CreateClientFor(administratorId, profileType: EnumProfileType.Administrator);
    }
}
