using System.Diagnostics.CodeAnalysis;
namespace FateConnect.Api;

using System.Globalization;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using DotNetEnv;
using FateConnect.Api.Infrastructure.Converters;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Infrastructure.Middlewares;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Rides.Repositories;
using FateConnect.Api.Modules.Rides.Services;
using FateConnect.Api.Modules.Users.Interfaces;
using FateConnect.Api.Modules.Users.Repositories;
using FateConnect.Api.Modules.Users.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.LostAndFound.Repositories;
using FateConnect.Api.Modules.LostAndFound.Services;
using FateConnect.Api.Modules.LostAndFound.Workers;
using FateConnect.Api.Modules.Common.Interfaces;
using FateConnect.Api.Modules.Denunciations.Interfaces;
using FateConnect.Api.Modules.Denunciations.Services;
using FateConnect.Api.Modules.Denunciations.Repositories;
using MassTransit;
using FateConnect.Api.Modules.Storage.Services;
using FateConnect.Api.Modules.Communications.Consumers;
using Resend;
using FateConnect.Api.Modules.Communications.Interfaces;
using FateConnect.Api.Modules.Communications.Services;

public class Program
{
    [ExcludeFromCodeCoverage]
    private Program() { }

    public static void Main(string[] args)
    {
        if (File.Exists(".env"))
        {
            Env.Load();
        }

        string publicUrl = Environment.GetEnvironmentVariable("PUBLIC_URL") ?? string.Empty;
        string emailSender = Environment.GetEnvironmentVariable("EMAIL_SENDER") ?? string.Empty;
        string resendApiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY") ?? string.Empty;

        if (string.IsNullOrWhiteSpace(publicUrl))
            throw new InvalidOperationException("A variável de ambiente PUBLIC_URL é obrigatória para gerar os links dos e-mails.");

        if (string.IsNullOrWhiteSpace(emailSender))
            throw new InvalidOperationException("A variável de ambiente EMAIL_SENDER é obrigatória para o envio de e-mails.");

        if (string.IsNullOrWhiteSpace(resendApiKey))
            throw new InvalidOperationException("A variável de ambiente RESEND_API_KEY é obrigatória para o envio de e-mails.");

        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        var originsEnv = Environment.GetEnvironmentVariable("CORS_ORIGINS");

        var allowedOrigins = string.IsNullOrWhiteSpace(originsEnv)
            ? ["http://localhost:5173"]
            : originsEnv.Split(',', StringSplitOptions.TrimEntries);

        const string corsPolicy = "AllowFrontend";

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(corsPolicy, policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        var jwtOptions = new JwtOptions
        {
            Secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? string.Empty,
            Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? string.Empty,
            Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? string.Empty,
            ExpirationHours = double.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRATION_HOURS"), out double hours) ? hours : 8
        };

        builder.Services.AddSingleton(Microsoft.Extensions.Options.Options.Create(jwtOptions));

        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<IUserService, UserService>();

        builder.Services.AddScoped<ITokenService, TokenService>();
        builder.Services.AddScoped<IAuthService, AuthService>();

        builder.Services.AddScoped<IRideRepository, RideRepository>();
        builder.Services.AddScoped<IRideService, RideService>();
        builder.Services.AddSingleton<IHolidayCalendar, HolidayCalendar>();

        builder.Services.AddSingleton(TimeProvider.System);

        builder.Services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.KnownNetworks.Clear();
            options.KnownProxies.Clear();
        });

        builder.Services.AddScoped<ILostAndFoundRepository, LostAndFoundRepository>();
        builder.Services.AddScoped<ILostAndFoundService, LostAndFoundService>();
        builder.Services.AddScoped<ILostAndFoundRetentionService, LostAndFoundRetentionService>();
        builder.Services.AddHostedService<LostAndFoundRetentionWorker>();

        builder.Services.AddScoped<IStorageService, StorageService>();

        builder.Services.AddScoped<IDenunciationRepository, DenunciationRepository>();
        builder.Services.AddScoped<IDenunciationService, DenunciationService>();

        builder.Services.AddScoped<IEmailService, EmailService>();

        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.Converters.Add(new TimeOnlyJsonConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.EnableAnnotations();

            options.MapType<DateOnly>(() => new OpenApiSchema
            {
                Type = "string",
                Format = "date",
                Example = new OpenApiString("2026-08-30")
            });

            options.MapType<TimeOnly>(() => new OpenApiSchema
            {
                Type = "string",
                Format = "time",
                Example = new OpenApiString("16:20:00")
            });

            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "FateConnect API",
                Version = "v1",
                Description = "Car pooling and academic connection platform API."
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer 12345abcdef'",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });

        byte[] key = Encoding.UTF8.GetBytes(jwtOptions.Secret);

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero
                };
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = RejectRevokedTokenAsync
                };
            });

        builder.Services.AddAuthorizationBuilder()
            .SetFallbackPolicy(new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build());

        string connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION") ?? string.Empty;

        builder.Services.AddDbContext<FateConnectDbContext>(options =>
            options.UseNpgsql(connectionString));

        builder.Services.AddMassTransit(x =>
        {
            x.AddEntityFrameworkOutbox<FateConnectDbContext>(o =>
            {
                o.UsePostgres();
                o.UseBusOutbox();
            });

            x.AddConsumer<UserRegisteredEventConsumer>();
            x.AddConsumer<PasswordResetRequestedEventConsumer>();
            x.AddConsumer<AccountLockedEventConsumer>();

            x.UsingRabbitMq((context, cfg) =>
            {
                string rabbitHostEnv = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? string.Empty;
                string rabbitUserEnv = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? string.Empty;
                string rabbitPassEnv = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? string.Empty;

                string rabbitHost = string.IsNullOrWhiteSpace(rabbitHostEnv) ? "localhost" : rabbitHostEnv;
                string rabbitUser = string.IsNullOrWhiteSpace(rabbitUserEnv) ? "guest" : rabbitUserEnv;
                string rabbitPass = string.IsNullOrWhiteSpace(rabbitPassEnv) ? "guest" : rabbitPassEnv;

                cfg.Host(rabbitHost, "/", h =>
                {
                    h.Username(rabbitUser);
                    h.Password(rabbitPass);
                });

                cfg.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));

                cfg.ReceiveEndpoint("user-registered-event", e =>
                {
                    e.UseEntityFrameworkOutbox<FateConnectDbContext>(context);
                    e.ConfigureConsumer<UserRegisteredEventConsumer>(context);
                });

                cfg.ReceiveEndpoint("password-reset-requested-event", e =>
                {
                    e.UseEntityFrameworkOutbox<FateConnectDbContext>(context);
                    e.ConfigureConsumer<PasswordResetRequestedEventConsumer>(context);
                });

                cfg.ReceiveEndpoint("account-locked-event", e =>
                {
                    e.UseEntityFrameworkOutbox<FateConnectDbContext>(context);
                    e.ConfigureConsumer<AccountLockedEventConsumer>(context);
                });
            });
        });

        builder.Services.AddResend(options =>
        {
            options.ApiToken = resendApiKey;
        });

        WebApplication app = builder.Build();

        using (IServiceScope scope = app.Services.CreateScope())
        {
            scope.ServiceProvider.GetRequiredService<FateConnectDbContext>().Database.Migrate();
        }

        app.UseMiddleware<GlobalExceptionMiddleware>();

        app.UseForwardedHeaders();

        app.UseCors(corsPolicy);

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }

    private static async Task RejectRevokedTokenAsync(TokenValidatedContext context)
    {
        string? carriedVersion = context.Principal?.FindFirstValue(TokenClaimNames.TokenVersion);
        string? identifier = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);

        bool isVersionReadable = int.TryParse(carriedVersion, CultureInfo.InvariantCulture, out int tokenVersion);
        bool isIdentifierReadable = int.TryParse(identifier, CultureInfo.InvariantCulture, out int userId);
        bool canCompareVersions = isVersionReadable && isIdentifierReadable;

        if (!canCompareVersions)
        {
            context.Fail("The token carries no readable version and cannot be checked against the current one.");

            return;
        }

        IUserRepository users = context.HttpContext.RequestServices.GetRequiredService<IUserRepository>();

        int? currentVersion = await users.GetTokenVersionAsync(userId);

        if (currentVersion != tokenVersion)
            context.Fail("The token version no longer matches the one the session carries.");
    }
}
