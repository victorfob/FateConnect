namespace FateConnect.Api.Infrastructure.OpenApi;

using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

public class ProblemDetailsSchemaFilter : ISchemaFilter
{
    private static readonly Dictionary<string, string> PropertyDescriptions = new()
    {
        ["type"] = "Address of the error type, standard per HTTP status.",
        ["title"] = "Short name of the HTTP status.",
        ["status"] = "HTTP status code of the response.",
        ["detail"] = "Explanation of this occurrence. Screens choose their own text from " +
            "`status`, `field` or `code`, never from this one.",
        ["instance"] = "Address of this occurrence, when there is one.",
        ["errors"] = "Fields refused by validation, each with its messages; only in validation refusals.",
    };

    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        if (!typeof(ProblemDetails).IsAssignableFrom(context.Type) || schema is not OpenApiSchema problem)
            return;

        problem.Description = "Error response in the RFC 9457 format. When the error points at a request field, " +
            "`field` names it; when the same status has more than one reason, `code` tells them apart; a locked " +
            "account also brings `minutesRemaining`.";

        problem.Properties ??= new Dictionary<string, IOpenApiSchema>();

        foreach ((string name, IOpenApiSchema property) in problem.Properties)
        {
            if (PropertyDescriptions.TryGetValue(name, out string? description) && property is OpenApiSchema described)
                described.Description = description;
        }

        if (context.Type != typeof(ProblemDetails))
            return;

        problem.Properties["field"] = new OpenApiSchema
        {
            Type = JsonSchemaType.String | JsonSchemaType.Null,
            Description = "Request field that caused the error, by its name in the request (`fatecEmail`, `phone`, " +
                "`contactEmail`). Only when the error points at a field."
        };
        problem.Properties["code"] = new OpenApiSchema
        {
            Type = JsonSchemaType.String | JsonSchemaType.Null,
            Description = "Reason of the error when the same status has more than one: `ContactRequired`, " +
                "`EmailNotConfirmed` or `AccountLocked`."
        };
        problem.Properties["minutesRemaining"] = new OpenApiSchema
        {
            Type = JsonSchemaType.Integer | JsonSchemaType.Null,
            Format = "int32",
            Description = "Minutes until a locked account unlocks by itself. Only with the code `AccountLocked`."
        };
    }
}
