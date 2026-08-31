using DotNet.Testcontainers.Builders;
using Npgsql;
using Testcontainers.PostgreSql;

namespace FateConnect.Api.Tests;

public static class TestDatabase
{
    private const string PostgresImage = "postgres:17";

    private const string DockerUnavailable =
        "The API suite runs against a real PostgreSQL, started as a container, and Docker did not answer. "
        + "Start Docker and run dotnet test again.";

    private static readonly Lazy<PostgreSqlContainer> RunningContainer = new(Start);

    public static string ConnectionStringFor(string databaseName)
    {
        NpgsqlConnectionStringBuilder connection = new(RunningContainer.Value.GetConnectionString())
        {
            Database = databaseName,
        };

        return connection.ConnectionString;
    }

    private static PostgreSqlContainer Start()
    {
        try
        {
            PostgreSqlContainer container = new PostgreSqlBuilder(PostgresImage).Build();
            container.StartAsync().GetAwaiter().GetResult();

            return container;
        }
        catch (DockerUnavailableException failure)
        {
            throw new InvalidOperationException(DockerUnavailable, failure);
        }
    }
}
