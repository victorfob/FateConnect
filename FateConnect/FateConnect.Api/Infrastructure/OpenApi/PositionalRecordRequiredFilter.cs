namespace FateConnect.Api.Infrastructure.OpenApi;

using System;
using System.Linq;
using System.Reflection;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

public class PositionalRecordRequiredFilter : ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        bool isRecord = context.Type.GetMethod("<Clone>$") is not null;

        if (!isRecord || schema is not OpenApiSchema { Properties.Count: > 0 } record)
            return;

        ParameterInfo[]? primaryParameters = context.Type.GetConstructors()
            .Select(constructor => constructor.GetParameters())
            .FirstOrDefault(parameters => parameters.Length > 0 && parameters.All(parameter =>
                context.Type.GetProperty(parameter.Name!) is not null));

        if (primaryParameters is null)
            return;

        NullabilityInfoContext nullability = new();

        foreach (ParameterInfo parameter in primaryParameters)
        {
            bool alwaysPresent = nullability.Create(parameter).ReadState == NullabilityState.NotNull;
            string? schemaName = record.Properties.Keys.FirstOrDefault(name =>
                string.Equals(name, parameter.Name, StringComparison.OrdinalIgnoreCase));

            if (alwaysPresent && schemaName is not null)
                (record.Required ??= new HashSet<string>()).Add(schemaName);
        }
    }
}
