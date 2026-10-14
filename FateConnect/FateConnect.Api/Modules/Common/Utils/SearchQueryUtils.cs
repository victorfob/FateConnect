namespace FateConnect.Api.Modules.Common.Utils;

using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

public static class SearchQueryUtils
{
    private static readonly Expression<Func<string, string, bool>> ContainsIgnoringCaseAndAccents =
        (column, escapedSearchTerm) => EF.Functions.ILike(
            EF.Functions.Unaccent(column),
            "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
            @"\");

    public static string SanitizeSearchTerm(this string searchTerm)
    {
        return searchTerm
            .Replace(@"\", @"\\")
            .Replace("%", @"\%")
            .Replace("_", @"\_");
    }

    public static IQueryable<T> WhereAnyColumnContains<T>(
        this IQueryable<T> query,
        string? searchTerm,
        params Expression<Func<T, string>>[] columns)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return query;

        string escapedSearchTerm = searchTerm.SanitizeSearchTerm();
        Expression<Func<string>> searchTermParameter = () => escapedSearchTerm;
        ParameterExpression item = Expression.Parameter(typeof(T), "item");

        Expression anyColumnMatches = columns
            .Select(column => ColumnMatches(column, item, searchTermParameter.Body))
            .Aggregate(Expression.OrElse);

        return query.Where(Expression.Lambda<Func<T, bool>>(anyColumnMatches, item));
    }

    private static Expression ColumnMatches<T>(
        Expression<Func<T, string>> column,
        ParameterExpression item,
        Expression escapedSearchTerm)
    {
        Expression columnOfItem = new ParameterReplacer(new() { [column.Parameters[0]] = item })
            .Visit(column.Body);

        return new ParameterReplacer(new()
        {
            [ContainsIgnoringCaseAndAccents.Parameters[0]] = columnOfItem,
            [ContainsIgnoringCaseAndAccents.Parameters[1]] = escapedSearchTerm,
        }).Visit(ContainsIgnoringCaseAndAccents.Body);
    }

    private sealed class ParameterReplacer(Dictionary<ParameterExpression, Expression> replacements)
        : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) =>
            replacements.GetValueOrDefault(node, node);
    }
}
