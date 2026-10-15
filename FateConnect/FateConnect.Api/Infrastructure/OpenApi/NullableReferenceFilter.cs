namespace FateConnect.Api.Infrastructure.OpenApi;

using System.Collections.Generic;
using System.Linq;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

public class NullableReferenceFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        IEnumerable<OpenApiSchema> nullableReferences = (swaggerDoc.Components?.Schemas?.Values ?? [])
            .OfType<OpenApiSchema>()
            .SelectMany(schema => schema.Properties?.Values ?? [])
            .OfType<OpenApiSchema>()
            .Where(property => property.Type == JsonSchemaType.Null && property.AllOf is { Count: 1 });

        foreach (OpenApiSchema property in nullableReferences)
        {
            property.AnyOf = [property.AllOf![0], new OpenApiSchema { Type = JsonSchemaType.Null }];
            property.AllOf = null;
            property.Type = null;
        }
    }
}
