namespace FateConnect.Api.Modules.Users.Filters;

using System.Linq;
using System.Reflection;
using System.Text.Json.Nodes;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

public class CurrentLegalDocumentsExampleFilter(ILegalDocumentVersions versions) : ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        MemberInfo? member = context.MemberInfo;

        if (member is null || schema is not OpenApiSchema concrete)
            return;

        if (member.GetCustomAttribute<CurrentDocumentVersionExampleAttribute>() is { } versionExample)
            concrete.Example = JsonValue.Create(versions.Current[versionExample.Document]);

        if (member.IsDefined(typeof(CurrentDocumentAcceptancesExampleAttribute)))
            concrete.Example = AcceptanceOfEveryCurrentDocument();
    }

    private JsonArray AcceptanceOfEveryCurrentDocument()
    {
        JsonNode?[] acceptances = [.. versions.Current
            .OrderBy(current => current.Key)
            .Select(current => new JsonObject
            {
                ["document"] = current.Key.ToString(),
                ["version"] = current.Value,
            })];

        return new JsonArray(acceptances);
    }
}
