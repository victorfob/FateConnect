namespace FateConnect.Api.Modules.Common.DTOs;

using Microsoft.AspNetCore.Mvc.ModelBinding;

public record PagedFilterDto
{
    public const int FirstPage = 1;
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 50;

    public int? Page { get; init; }
    public int? PageSize { get; init; }

    [BindNever]
    public int EffectivePage => Math.Max(FirstPage, Page ?? FirstPage);

    [BindNever]
    public int ItemsToSkip => (EffectivePage - FirstPage) * EffectivePageSize;

    [BindNever]
    public int EffectivePageSize
    {
        get
        {
            int requested = PageSize ?? DefaultPageSize;

            if (requested < FirstPage)
                return DefaultPageSize;

            return Math.Min(requested, MaxPageSize);
        }
    }
}
