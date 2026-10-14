namespace FateConnect.Api.Modules.Common.Extensions;

using System.Linq.Expressions;
using FateConnect.Api.Modules.Common.DTOs;
using Microsoft.EntityFrameworkCore;

public static class QueryableExtensions
{
    public static async Task<(IReadOnlyList<T> Items, int Total)> ToPageAsync<T>(
        this IQueryable<T> query,
        PagedFilterDto filter,
        Func<IQueryable<T>, IOrderedQueryable<T>> order)
    {
        return await query.ToPageAsync(filter, order, item => item);
    }

    public static async Task<(IReadOnlyList<TResult> Items, int Total)> ToPageAsync<T, TResult>(
        this IQueryable<T> query,
        PagedFilterDto filter,
        Func<IQueryable<T>, IOrderedQueryable<T>> order,
        Expression<Func<T, TResult>> selector)
    {
        int total = await query.CountAsync();

        List<TResult> items = await order(query)
            .Skip(filter.ItemsToSkip)
            .Take(filter.EffectivePageSize)
            .Select(selector)
            .ToListAsync();

        return (items, total);
    }
}
