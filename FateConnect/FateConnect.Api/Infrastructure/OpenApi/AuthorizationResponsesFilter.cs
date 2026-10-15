namespace FateConnect.Api.Infrastructure.OpenApi;

using System.Globalization;
using System.Linq;
using FateConnect.Api.Modules.Auth.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public class AuthorizationResponsesFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        IList<object> metadata = context.ApiDescription.ActionDescriptor.EndpointMetadata;

        if (metadata.OfType<IAllowAnonymous>().Any())
            return;

        OpenApiSecurityScheme bearer = new()
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = OpenApiDocumentSetup.BearerScheme
            }
        };
        operation.Security = [new OpenApiSecurityRequirement { [bearer] = [] }];

        AddProblem(
            operation,
            context,
            StatusCodes.Status401Unauthorized,
            "No valid session: the token is missing, expired or revoked.");

        if (metadata.OfType<AuthorizeProfileAttribute>().Any())
            AddProblem(
                operation,
                context,
                StatusCodes.Status403Forbidden,
                "The session's profile is not allowed to use this operation.");
    }

    private static void AddProblem(
        OpenApiOperation operation,
        OperationFilterContext context,
        int statusCode,
        string description)
    {
        OpenApiResponse response = new() { Description = description };
        response.Content[OpenApiDocumentSetup.ProblemMediaType] = new OpenApiMediaType
        {
            Schema = context.SchemaGenerator.GenerateSchema(typeof(ProblemDetails), context.SchemaRepository)
        };

        operation.Responses.TryAdd(statusCode.ToString(CultureInfo.InvariantCulture), response);
    }
}
