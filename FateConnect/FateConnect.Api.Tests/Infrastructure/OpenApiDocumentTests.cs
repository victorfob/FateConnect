using System.Net;
using System.Text.Json;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Services;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Infrastructure;

public class OpenApiDocumentTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string ExportPathVariable = "OPENAPI_DOCUMENT_PATH";
    private const string ProblemMediaType = "application/problem+json";

    private async Task<JsonElement> DocumentAsync()
    {
        string json = await factory.CreateClient().GetStringAsync("/swagger/v1/swagger.json");

        return JsonDocument.Parse(json).RootElement;
    }

    private static JsonElement Operation(JsonElement document, string path, string method) =>
        document.GetProperty("paths").GetProperty(path).GetProperty(method);

    private static IReadOnlyList<string> ResponseCodes(JsonElement operation) =>
        [.. operation.GetProperty("responses").EnumerateObject().Select(response => response.Name)];

    private static IReadOnlyList<string> ContentTypes(JsonElement operation, string statusCode) =>
        [
            .. operation.GetProperty("responses").GetProperty(statusCode).GetProperty("content")
                .EnumerateObject().Select(content => content.Name),
        ];

    private static IReadOnlyList<string?> Types(JsonElement schema)
    {
        JsonElement type = schema.GetProperty("type");

        if (type.ValueKind == JsonValueKind.String)
            return [type.GetString()];

        return [.. type.EnumerateArray().Select(name => name.GetString())];
    }

    [Fact]
    public async Task Document_DescribesTheApiAndIsExportedWhenAsked()
    {
        string json = await factory.CreateClient().GetStringAsync("/swagger/v1/swagger.json");

        using JsonDocument document = JsonDocument.Parse(json);
        Assert.StartsWith("3.1.", document.RootElement.GetProperty("openapi").GetString());
        Assert.NotEmpty(document.RootElement.GetProperty("paths").EnumerateObject());

        string? exportPath = Environment.GetEnvironmentVariable(ExportPathVariable);

        if (!string.IsNullOrWhiteSpace(exportPath))
            await File.WriteAllTextAsync(exportPath, json);
    }

    [Fact]
    public async Task Header_CarriesTheLicenseAndTheVersionOfTheApi()
    {
        JsonElement info = (await DocumentAsync()).GetProperty("info");

        Assert.Equal("MIT", info.GetProperty("license").GetProperty("name").GetString());
        Assert.Equal(typeof(Program).Assembly.GetName().Version!.ToString(3), info.GetProperty("version").GetString());
    }

    [Fact]
    public async Task Servers_DeclaresTheRootSoThePageAddsTheBasePathOfTheEnvironment()
    {
        JsonElement server = Assert.Single((await DocumentAsync()).GetProperty("servers").EnumerateArray());

        Assert.Equal("/", server.GetProperty("url").GetString());
    }

    [Fact]
    public async Task Security_IsDeclaredOnlyOnTheOperationsThatNeedASession()
    {
        JsonElement document = await DocumentAsync();

        JsonElement login = Operation(document, "/Auth/login", "post");
        JsonElement rides = Operation(document, "/Rides", "get");

        Assert.False(document.TryGetProperty("security", out _));
        Assert.False(login.TryGetProperty("security", out _));
        Assert.Equal(JsonValueKind.Array, rides.GetProperty("security").ValueKind);
        Assert.Contains("401", ResponseCodes(rides));
        Assert.DoesNotContain("403", ResponseCodes(rides));
    }

    [Fact]
    public async Task AnOperationGatedByProfile_DocumentsTheForbiddenAnswer()
    {
        JsonElement listUsers = Operation(await DocumentAsync(), "/Users", "get");

        Assert.Contains("403", ResponseCodes(listUsers));
        Assert.Equal([ProblemMediaType], ContentTypes(listUsers, "403"));
    }

    [Fact]
    public async Task ValidationAnswer_IsDocumentedOnlyWhereTheRequestCarriesInput()
    {
        JsonElement document = await DocumentAsync();

        Assert.Contains("400", ResponseCodes(Operation(document, "/Rides", "get")));
        Assert.Contains("400", ResponseCodes(Operation(document, "/Rides", "post")));
        Assert.DoesNotContain("400", ResponseCodes(Operation(document, "/Rides/{id}", "get")));
    }

    [Fact]
    public async Task ContentTypes_AreJsonOnSuccessProblemOnErrorAndImageOnPhotos()
    {
        JsonElement document = await DocumentAsync();

        JsonElement getRide = Operation(document, "/Rides/{id}", "get");
        JsonElement reportImage = Operation(document, "/Reports/{id}/image", "get");

        Assert.Equal(["application/json"], ContentTypes(getRide, "200"));
        Assert.Equal([ProblemMediaType], ContentTypes(getRide, "404"));
        Assert.Equal(["image/jpeg", "image/png", "image/webp"], ContentTypes(reportImage, "200"));
        Assert.Equal(
            ["application/json"],
            [.. Operation(document, "/Rides", "post").GetProperty("requestBody").GetProperty("content")
                .EnumerateObject().Select(content => content.Name)]);
    }

    [Fact]
    public async Task ProblemSchema_DeclaresTheExtensionsTheFrontReads()
    {
        JsonElement problem = (await DocumentAsync())
            .GetProperty("components").GetProperty("schemas").GetProperty("ProblemDetails").GetProperty("properties");

        Assert.True(problem.TryGetProperty("field", out _));
        Assert.True(problem.TryGetProperty("code", out _));
        Assert.True(problem.TryGetProperty("minutesRemaining", out _));
        Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("detail").GetProperty("description").GetString()));
    }

    [Fact]
    public async Task ResponseSchemas_RequireWhatIsNeverNullAndMarkTheRestNullable()
    {
        JsonElement ride = (await DocumentAsync()).GetProperty("components").GetProperty("schemas")
            .GetProperty("ReadRideDto");

        IReadOnlyList<string?> required =
            [.. ride.GetProperty("required").EnumerateArray().Select(name => name.GetString())];
        JsonElement properties = ride.GetProperty("properties");

        Assert.Contains("id", required);
        Assert.Contains("destination", required);
        Assert.DoesNotContain("description", required);
        Assert.DoesNotContain("repeatUntil", required);
        Assert.Equal(["null", "string"], Types(properties.GetProperty("description")));
        Assert.Equal(["string"], Types(properties.GetProperty("destination")));
    }

    [Fact]
    public async Task NullableReferences_AcceptTheReferencedSchemaOrNull()
    {
        JsonElement schemas = (await DocumentAsync()).GetProperty("components").GetProperty("schemas");

        JsonElement optionalRideType = schemas.GetProperty("UpdateRideDto").GetProperty("properties")
            .GetProperty("rideType");
        JsonElement requiredRideType = schemas.GetProperty("CreateRideDto").GetProperty("properties")
            .GetProperty("rideType");
        IReadOnlyList<JsonElement> alternatives = [.. optionalRideType.GetProperty("anyOf").EnumerateArray()];

        Assert.Equal("#/components/schemas/EnumRideType", alternatives[0].GetProperty("$ref").GetString());
        Assert.Equal(["null"], Types(alternatives[1]));
        Assert.False(optionalRideType.TryGetProperty("type", out _));
        Assert.False(optionalRideType.TryGetProperty("allOf", out _));
        Assert.Equal(
            "#/components/schemas/EnumRideType",
            Assert.Single(requiredRideType.GetProperty("allOf").EnumerateArray()).GetProperty("$ref").GetString());
        Assert.False(requiredRideType.TryGetProperty("anyOf", out _));
    }

    [Fact]
    public async Task RequestBodies_CarryExamplesInsteadOfDefaults()
    {
        JsonElement schemas = (await DocumentAsync()).GetProperty("components").GetProperty("schemas");

        JsonElement loginEmail = schemas.GetProperty("LoginDto").GetProperty("properties").GetProperty("fatecEmail");
        JsonElement acceptances = schemas.GetProperty("CreateUserDto").GetProperty("properties")
            .GetProperty("acceptances");

        Assert.Equal("joao.silva999@aluno.cps.sp.gov.br", loginEmail.GetProperty("example").GetString());
        Assert.False(loginEmail.TryGetProperty("default", out _));
        Assert.Equal(JsonValueKind.Array, acceptances.GetProperty("example").ValueKind);
    }

    [Fact]
    public async Task ApiReference_OpensWithoutATokenAndReadsTheDocumentByARelativeAddress()
    {
        HttpClient client = factory.CreateClient();

        HttpResponseMessage page = await client.GetAsync("/scalar/v1");
        HttpResponseMessage script = await client.GetAsync("/scalar/scalar.js");

        Assert.Equal(HttpStatusCode.OK, page.StatusCode);
        string html = await page.Content.ReadAsStringAsync();
        Assert.Contains("\"url\":\"swagger/v1/swagger.json\"", html);
        Assert.Equal(HttpStatusCode.OK, script.StatusCode);
    }

    [Fact]
    public async Task SwaggerUi_IsNoLongerServed()
    {
        HttpClient client = factory.CreateClientForNewUser("Bianca Torres Melo");

        HttpResponseMessage response = await client.GetAsync("/swagger/index.html");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DocumentAcceptanceExamples_CarryTheCurrentVersionOfEachDocument()
    {
        using ApiFactory raisedFactory = new()
        {
            DocumentVersions = new LegalDocumentVersions(new Dictionary<EnumDocumentType, string>
            {
                [EnumDocumentType.TermsOfUse] = "2031-01-02",
                [EnumDocumentType.PrivacyPolicy] = "2031-03-04",
            }),
        };
        string json = await raisedFactory.CreateClient().GetStringAsync("/swagger/v1/swagger.json");
        JsonElement schemas = JsonDocument.Parse(json).RootElement.GetProperty("components").GetProperty("schemas");
        string expected = """[{"document":"TermsOfUse","version":"2031-01-02"},{"document":"PrivacyPolicy","version":"2031-03-04"}]""";

        string Example(string schema, string property) =>
            schemas.GetProperty(schema).GetProperty("properties").GetProperty(property).GetProperty("example").GetRawText();

        Assert.Equal(expected, JsonSerializer.Serialize(JsonDocument.Parse(Example("CreateUserDto", "acceptances")).RootElement));
        Assert.Equal(expected, JsonSerializer.Serialize(JsonDocument.Parse(Example("AcceptDocumentsDto", "acceptances")).RootElement));
        Assert.Equal("\"2031-01-02\"", Example("DocumentAcceptanceDto", "version"));
    }
}
