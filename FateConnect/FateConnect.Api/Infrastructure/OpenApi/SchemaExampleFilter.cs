namespace FateConnect.Api.Infrastructure.OpenApi;

using System.Reflection;
using System.Text.Json;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public class SchemaExampleFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        SchemaExampleAttribute? example = context.MemberInfo?.GetCustomAttribute<SchemaExampleAttribute>();

        if (example is null)
            return;

        string json = example.IsJson ? (string)example.Value : JsonSerializer.Serialize(example.Value);

        schema.Example = OpenApiAnyFactory.CreateFromJson(json);
    }
}
