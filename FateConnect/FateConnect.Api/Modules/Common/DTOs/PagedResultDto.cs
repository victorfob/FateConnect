namespace FateConnect.Api.Modules.Common.DTOs;

public record PagedResultDto<T>
{
    public required IReadOnlyList<T> Items { get; init; }
    public required int Page { get; init; }
    public required int PageSize { get; init; }
    public required int Total { get; init; }

    public int TotalPages => (Total + PageSize - 1) / PageSize;
}
