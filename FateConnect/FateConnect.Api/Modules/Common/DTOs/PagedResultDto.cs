namespace FateConnect.Api.Modules.Common.DTOs;

using Swashbuckle.AspNetCore.Annotations;

public record PagedResultDto<T>
{
    [SwaggerSchema("Items of the page.")]
    public required IReadOnlyList<T> Items { get; init; }
    [SwaggerSchema("Number of the page returned.")]
    public required int Page { get; init; }
    [SwaggerSchema("Items per page used.")]
    public required int PageSize { get; init; }
    [SwaggerSchema("Number of items across every page.")]
    public required int Total { get; init; }

    [SwaggerSchema("Number of pages with the page size used.")]
    public int TotalPages => (Total + PageSize - 1) / PageSize;
}
