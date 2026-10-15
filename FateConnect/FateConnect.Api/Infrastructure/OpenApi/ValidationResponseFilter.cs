namespace FateConnect.Api.Infrastructure.OpenApi;

using System.Globalization;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

public class ValidationResponseFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        bool receivesInput = context.ApiDescription.ParameterDescriptions.Any(parameter =>
            parameter.Source == BindingSource.Body
            || parameter.Source == BindingSource.Form
            || parameter.Source == BindingSource.FormFile
            || parameter.Source == BindingSource.Query);

        if (!receivesInput)
            return;

        OpenApiResponse response = new()
        {
            Description = "The request is invalid: a field failed validation, listed in `errors`, or a rule refused " +
                "it, explained in `detail`.",
            Content = new Dictionary<string, OpenApiMediaType>
            {
                [OpenApiDocumentSetup.ProblemMediaType] = new()
                {
                    Schema = context.SchemaGenerator.GenerateSchema(
                        typeof(ValidationProblemDetails),
                        context.SchemaRepository)
                }
            }
        };

        operation.Responses ??= [];
        operation.Responses.TryAdd(
            StatusCodes.Status400BadRequest.ToString(CultureInfo.InvariantCulture),
            response);
    }
}
