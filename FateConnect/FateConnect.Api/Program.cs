namespace FateConnect.Api;

using System.Text;
using System.Text.Json.Serialization;
using DotNetEnv;
using FateConnect.Api.Infrastructure.Converters;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Infrastructure.Middlewares;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Rides.Repositories;
using FateConnect.Api.Modules.Rides.Services;
using FateConnect.Api.Modules.Usuarios.Interfaces;
using FateConnect.Api.Modules.Usuarios.Repositories;
using FateConnect.Api.Modules.Usuarios.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;

public class Program
{
    public static void Main(string[] args)
    {
        if (File.Exists(".env"))
        {
            Env.Load();
        }

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

        builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        builder.Services.AddScoped<IUsuarioService, UsuarioService>();

        builder.Services.AddScoped<ITokenService, TokenService>();
        builder.Services.AddScoped<IAuthService, AuthService>();

        builder.Services.AddScoped<IRideRepository, RideRepository>();
        builder.Services.AddScoped<IRideService, RideService>();

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
            });

        builder.Services.AddAuthorizationBuilder()
            .SetFallbackPolicy(new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build());

        string connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION") ?? string.Empty;

        builder.Services.AddDbContext<FateConnectDbContext>(options =>
            options.UseNpgsql(connectionString));

        WebApplication app = builder.Build();

        using (IServiceScope scope = app.Services.CreateScope())
        {
            scope.ServiceProvider.GetRequiredService<FateConnectDbContext>().Database.Migrate();
        }

        app.UseMiddleware<GlobalExceptionMiddleware>();

        app.UseCors(corsPolicy);

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}
