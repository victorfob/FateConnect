namespace FateConnect.Api.Modules.Common.DTOs;

using Microsoft.AspNetCore.Mvc.ModelBinding;
using Swashbuckle.AspNetCore.Annotations;

public record PagedFilterDto
{
    public const int FirstPage = 1;
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 50;

    [SwaggerParameter("Page number, starting at 1. Absent or below 1 means the first page.")]
    public int? Page { get; init; }
    [SwaggerParameter("Items per page. Absent or below 1 uses the default size, and above the maximum is capped.")]
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
