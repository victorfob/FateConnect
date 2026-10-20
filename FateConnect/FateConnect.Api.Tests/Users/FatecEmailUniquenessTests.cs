using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Exceptions;
using FateConnect.Api.Modules.Users.Repositories;
using FateConnect.Api.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests.Users;

public class FatecEmailUniquenessTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public FatecEmailUniquenessTests(ApiFactory factory) => _factory = factory;

    private static User NewAccount(string fatecEmail) => new(
        fatecEmail,
        passwordHash: "hash-sem-valor-fora-desta-suite",
        fullName: "Mariana Alves Rocha",
        birthDate: new DateOnly(2000, 1, 1),
        contact: null,
        createdAt: DateTime.UtcNow);

    private static string NewFatecEmail() => $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br";

    [Fact]
    public async Task AddAsync_OfAnAccountWithAFatecEmailInUse_AnswersTheEmailAlreadyRegistered()
    {
        (_, string takenEmail) = _factory.SeedUserWithPassword("Bruno Carvalho Souza", "SenhaForte123!");
        using IServiceScope scope = _factory.Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();
        UserRepository repository = new(context, TimeProvider.System);

        EmailAlreadyRegisteredException refusal = await Assert.ThrowsAsync<EmailAlreadyRegisteredException>(
            () => repository.AddAsync(NewAccount(takenEmail)));

        Assert.Equal("fatecEmail", refusal.Field);
        Assert.Contains(takenEmail, refusal.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task AddAsync_OfAnAccountWithANewFatecEmail_StoresIt()
    {
        string fatecEmail = NewFatecEmail();
        using IServiceScope scope = _factory.Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();
        UserRepository repository = new(context, TimeProvider.System);

        await repository.AddAsync(NewAccount(fatecEmail));

        Assert.Equal(1, await context.Users.CountAsync(user => user.FatecEmail == fatecEmail));
    }

    [Fact]
    public async Task SaveChangesAsync_OfAnAdministratorEditTakingAFatecEmailInUse_AnswersTheEmailAlreadyRegistered()
    {
        (_, string takenEmail) = _factory.SeedUserWithPassword("Bruno Carvalho Souza", "SenhaForte123!");
        (int editedId, _) = _factory.SeedUserWithPassword("Carla Mendes Lima", "SenhaForte123!");
        using IServiceScope scope = _factory.Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();
        UserRepository repository = new(context, TimeProvider.System);
        User edited = (await repository.GetByIdAsync(editedId))!;

        edited.UpdateByAdmin(edited.FullName, takenEmail, contact: null, DateTime.UtcNow);

        EmailAlreadyRegisteredException refusal = await Assert.ThrowsAsync<EmailAlreadyRegisteredException>(
            repository.SaveChangesAsync);

        Assert.Equal("fatecEmail", refusal.Field);
    }
}
