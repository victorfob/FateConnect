namespace FateConnect.Api.Infrastructure.OpenApi;

using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

public class SchemaExampleFilter : ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        SchemaExampleAttribute? example = context.MemberInfo?.GetCustomAttribute<SchemaExampleAttribute>();

        if (example is null || schema is not OpenApiSchema concrete)
            return;

        string json = example.IsJson ? (string)example.Value : JsonSerializer.Serialize(example.Value);

        concrete.Example = JsonNode.Parse(json);
    }
}
