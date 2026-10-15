namespace FateConnect.Api.Modules.Users.Filters;

using System.Linq;
using System.Reflection;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public class CurrentLegalDocumentsExampleFilter(ILegalDocumentVersions versions) : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        MemberInfo? member = context.MemberInfo;

        if (member is null)
            return;

        if (member.GetCustomAttribute<CurrentDocumentVersionExampleAttribute>() is { } versionExample)
            schema.Example = new OpenApiString(versions.Current[versionExample.Document]);

        if (member.IsDefined(typeof(CurrentDocumentAcceptancesExampleAttribute)))
            schema.Example = AcceptanceOfEveryCurrentDocument();
    }

    private OpenApiArray AcceptanceOfEveryCurrentDocument()
    {
        OpenApiArray acceptances = [];
        acceptances.AddRange(versions.Current
            .OrderBy(current => current.Key)
            .Select(current => new OpenApiObject
            {
                ["document"] = new OpenApiString(current.Key.ToString()),
                ["version"] = new OpenApiString(current.Value),
            }));

        return acceptances;
    }
}
