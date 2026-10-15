namespace FateConnect.Api.Infrastructure.Database;

using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

public static class DbContextExtensions
{
    public static async Task<TEntity> AddAndLoadAsync<TEntity, TReference>(
        this DbContext context,
        TEntity entity,
        Expression<Func<TEntity, TReference?>> reference,
        bool loadsReference = true)
        where TEntity : class
        where TReference : class
    {
        context.Add(entity);
        await context.SaveChangesAsync();

        if (loadsReference)
            await context.Entry(entity).Reference(reference).LoadAsync();

        return entity;
    }
}
