namespace FateConnect.Api.Infrastructure.OpenApi;

using System;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

public static class OpenApiDocumentSetup
{
    public const string DocumentName = "v1";
    public const string BearerScheme = "Bearer";
    public const string ProblemMediaType = "application/problem+json";

    public static IServiceCollection AddOpenApiDocument(this IServiceCollection services)
    {
        string apiVersion = typeof(Program).Assembly.GetName().Version?.ToString(3) ?? "0.0.0";

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.EnableAnnotations();
            options.SupportNonNullableReferenceTypes();
            options.UseAllOfToExtendReferenceSchemas();
            options.SchemaFilter<SchemaExampleFilter>();
            options.SchemaFilter<PositionalRecordRequiredFilter>();
            options.SchemaFilter<ProblemDetailsSchemaFilter>();

            options.MapType<DateOnly>(() => new OpenApiSchema
            {
                Type = JsonSchemaType.String,
                Format = "date",
                Example = JsonValue.Create("2026-08-30")
            });

            options.MapType<TimeOnly>(() => new OpenApiSchema
            {
                Type = JsonSchemaType.String,
                Format = "time",
                Example = JsonValue.Create("16:20:00")
            });

            options.SwaggerDoc(DocumentName, new OpenApiInfo
            {
                Title = "FateConnect API",
                Version = apiVersion,
                Description = "Car pooling and academic connection platform API.",
                License = new OpenApiLicense { Name = "MIT" }
            });

            options.AddServer(new OpenApiServer { Url = "/" });

            options.AddSecurityDefinition(BearerScheme, new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer 12345abcdef'",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = BearerScheme,
                BearerFormat = "JWT",
                In = ParameterLocation.Header
            });

            options.OperationFilter<AuthorizationResponsesFilter>();
            options.OperationFilter<ValidationResponseFilter>();
            options.OperationFilter<JsonContentTypesFilter>();
            options.DocumentFilter<NullableReferenceFilter>();
        });

        return services;
    }

    public static void UseOpenApiDocument(this WebApplication app) =>
        app.UseSwagger(options => options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_1);

    public static void MapApiReference(this WebApplication app)
    {
        app.MapScalarApiReference(options => options
                .WithTitle("FateConnect API")
                .WithOpenApiRoutePattern("swagger/{documentName}/swagger.json")
                .WithDynamicBaseServerUrl())
            .AllowAnonymous();
    }
}
