namespace FateConnect.Api;

using System.Diagnostics.CodeAnalysis;
using System.Text;
using System.Text.Json.Serialization;
using DotNetEnv;
using FateConnect.Api.Infrastructure.Configuration;
using FateConnect.Api.Infrastructure.Converters;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Infrastructure.Middlewares;
using FateConnect.Api.Infrastructure.Observability;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Auth.Options;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Reports.Interfaces;
using FateConnect.Api.Modules.Reports.Repositories;
using FateConnect.Api.Modules.Reports.Services;
using FateConnect.Api.Modules.Emails.Consumers;
using FateConnect.Api.Modules.Emails.Interfaces;
using FateConnect.Api.Modules.Emails.Options;
using FateConnect.Api.Modules.Emails.Services;
using FateConnect.Api.Modules.InAppNotifications.Consumers;
using FateConnect.Api.Modules.InAppNotifications.Hubs;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.InAppNotifications.Repositories;
using FateConnect.Api.Modules.InAppNotifications.Services;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.LostAndFound.Repositories;
using FateConnect.Api.Modules.LostAndFound.Services;
using FateConnect.Api.Modules.LostAndFound.Workers;
using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Rides.Repositories;
using FateConnect.Api.Modules.Rides.Services;
using FateConnect.Api.Modules.Storage.Interfaces;
using FateConnect.Api.Modules.Storage.Services;
using FateConnect.Api.Modules.Users.Interfaces;
using FateConnect.Api.Modules.Users.Repositories;
using FateConnect.Api.Modules.Users.Services;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Resend;
using Sentry.AspNetCore;
using Sentry.Extensibility;

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

        RequiredSettings settings = RequiredSettings.Read(Environment.GetEnvironmentVariable);

        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        builder.WebHost.UseSentry(options =>
        {
            options.Dsn = Environment.GetEnvironmentVariable("SENTRY_DSN") ?? string.Empty;
            options.SendDefaultPii = false;
            options.MaxRequestBodySize = RequestSize.None;
            options.MinimumBreadcrumbLevel = LogLevel.None;
            options.MinimumEventLevel = LogLevel.None;
            options.SetBeforeSend(SentryEventScrubber.Scrub);
        });

        builder.Services.AddSingleton<IErrorReporter, SentryErrorReporter>();

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
            Secret = settings.JwtSecret,
            Issuer = settings.JwtIssuer,
            Audience = settings.JwtAudience,
            ExpirationHours = double.TryParse(
                Environment.GetEnvironmentVariable("JWT_EXPIRATION_HOURS"),
                out double hours) ? hours : 8
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

        builder.Services.AddScoped<IReportRepository, ReportRepository>();
        builder.Services.AddScoped<IReportService, ReportService>();

        builder.Services.AddScoped<IEmailService, EmailService>();
        builder.Services.AddSingleton(
            Microsoft.Extensions.Options.Options.Create(new EmailOptions(settings.PublicUrl, settings.EmailSender)));

        builder.Services.AddScoped<IInAppNotificationRepository, InAppNotificationRepository>();
        builder.Services.AddScoped<IInAppNotificationService, InAppNotificationService>();

        builder.Services.AddProblemDetails();

        builder.Services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
                options.InvalidModelStateResponseFactory = InvalidModelStateLogging.LoggingFirst(
                    options.InvalidModelStateResponseFactory))
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.Converters.Add(new TimeOnlyJsonConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

        builder.Services.AddSignalR()
            .AddJsonProtocol(options =>
            {
                options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.PayloadSerializerOptions.Converters.Add(new TimeOnlyJsonConverter());
                options.PayloadSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
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
                    OnTokenValidated = TokenVersionCheck.RejectRevokedTokenAsync,
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notifications"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddAuthorizationBuilder()
            .SetFallbackPolicy(new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build());

        builder.Services.AddDbContext<FateConnectDbContext>(options =>
            options.UseNpgsql(settings.DbConnection));

        builder.Services.AddHealthChecks()
            .AddDbContextCheck<FateConnectDbContext>();

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

            x.AddConsumer<RideCreatedEventConsumer>();
            x.AddConsumer<ReportReceivedEventConsumer>();
            x.AddConsumer<ItemArchivedEventConsumer>();
            x.AddConsumer<NotificationDispatchedEventConsumer>();

            x.UsingRabbitMq(ConfigureRabbitMq);
        });

        builder.Services.AddResend(options =>
        {
            options.ApiToken = settings.ResendApiKey;
        });

        WebApplication app = builder.Build();

        using (IServiceScope scope = app.Services.CreateScope())
        {
            scope.ServiceProvider.GetRequiredService<FateConnectDbContext>().Database.Migrate();
        }

        app.UseMiddleware<GlobalExceptionMiddleware>();
        app.UseStatusCodePages(context =>
            TypedResults.Problem(statusCode: context.HttpContext.Response.StatusCode).ExecuteAsync(context.HttpContext));

        app.UseForwardedHeaders();

        app.UseCors(corsPolicy);

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResultStatusCodes = { [HealthStatus.Degraded] = StatusCodes.Status503ServiceUnavailable },
            ResponseWriter = HealthResponse.WriteAsync,
        }).AllowAnonymous();

        app.MapHub<NotificationHub>("/hubs/notifications", options =>
        {
            options.CloseOnAuthenticationExpiration = true;
        });

        app.Run();
    }

    [ExcludeFromCodeCoverage]
    private static void ConfigureRabbitMq(IBusRegistrationContext context, IRabbitMqBusFactoryConfigurator cfg)
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

        cfg.UseMessageRetry(
            r => r.Exponential(5, TimeSpan.FromSeconds(1), TimeSpan.FromMinutes(1), TimeSpan.FromSeconds(5)));

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

        cfg.ReceiveEndpoint("ride-created-event", e =>
        {
            e.UseEntityFrameworkOutbox<FateConnectDbContext>(context);
            e.ConfigureConsumer<RideCreatedEventConsumer>(context);
        });

        cfg.ReceiveEndpoint("report-received-event", e =>
        {
            e.UseEntityFrameworkOutbox<FateConnectDbContext>(context);
            e.ConfigureConsumer<ReportReceivedEventConsumer>(context);
        });

        cfg.ReceiveEndpoint("item-archived-event", e =>
        {
            e.UseEntityFrameworkOutbox<FateConnectDbContext>(context);
            e.ConfigureConsumer<ItemArchivedEventConsumer>(context);
        });

        cfg.ReceiveEndpoint("notification-dispatched-event", e =>
        {
            e.UseEntityFrameworkOutbox<FateConnectDbContext>(context);
            e.ConfigureConsumer<NotificationDispatchedEventConsumer>(context);
        });
    }
}
