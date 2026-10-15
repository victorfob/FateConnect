namespace FateConnect.Api.Infrastructure.OpenApi;

using System.Linq;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public class JsonContentTypesFilter : IOperationFilter
{
    private const string JsonMediaType = "application/json";

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (operation.RequestBody?.Content.ContainsKey(JsonMediaType) == true)
            KeepOnly(operation.RequestBody.Content, JsonMediaType);

        foreach ((string statusCode, OpenApiResponse response) in operation.Responses)
        {
            bool isError = statusCode.StartsWith('4') || statusCode.StartsWith('5');

            if (isError)
                KeepOnly(response.Content, OpenApiDocumentSetup.ProblemMediaType);
            else if (response.Content.ContainsKey(JsonMediaType))
                KeepOnly(response.Content, JsonMediaType);
        }
    }

    private static void KeepOnly(IDictionary<string, OpenApiMediaType> content, string mediaType)
    {
        if (content.Count == 0)
            return;

        OpenApiMediaType kept = content.TryGetValue(mediaType, out OpenApiMediaType? exact)
            ? exact
            : content.Values.First();

        content.Clear();
        content[mediaType] = kept;
    }
}
