namespace FateConnect.Api.Infrastructure.Database.Migrations;

public static class DuplicatedContactCleanup
{
    public const string Sql = """
        CREATE TEMP TABLE duplicated_contact_users AS
        SELECT DISTINCT "UserId"
        FROM "Contacts"
        WHERE "Id" NOT IN (SELECT MIN("Id") FROM "Contacts" GROUP BY "Phone")
           OR "Id" NOT IN (SELECT MIN("Id") FROM "Contacts" GROUP BY "ContactEmail");

        DELETE FROM "Rides"
        WHERE "DriverId" IN (SELECT "UserId" FROM duplicated_contact_users);

        DELETE FROM "Users"
        WHERE "Id" IN (SELECT "UserId" FROM duplicated_contact_users);

        DROP TABLE duplicated_contact_users;
        """;
}
