namespace FateConnect.Api.Infrastructure.OpenApi;

using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
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

    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (!typeof(ProblemDetails).IsAssignableFrom(context.Type))
            return;

        schema.Description = "Error response in the RFC 9457 format. When the error points at a request field, " +
            "`field` names it; when the same status has more than one reason, `code` tells them apart; a locked " +
            "account also brings `minutesRemaining`.";

        foreach ((string name, OpenApiSchema property) in schema.Properties)
        {
            if (PropertyDescriptions.TryGetValue(name, out string? description))
                property.Description = description;
        }

        if (context.Type != typeof(ProblemDetails))
            return;

        schema.Properties["field"] = new OpenApiSchema
        {
            Type = "string",
            Nullable = true,
            Description = "Request field that caused the error, by its name in the request (`fatecEmail`, `phone`, " +
                "`contactEmail`). Only when the error points at a field."
        };
        schema.Properties["code"] = new OpenApiSchema
        {
            Type = "string",
            Nullable = true,
            Description = "Reason of the error when the same status has more than one: `ContactRequired`, " +
                "`EmailNotConfirmed` or `AccountLocked`."
        };
        schema.Properties["minutesRemaining"] = new OpenApiSchema
        {
            Type = "integer",
            Format = "int32",
            Nullable = true,
            Description = "Minutes until a locked account unlocks by itself. Only with the code `AccountLocked`."
        };
    }
}
