using FateConnect.Api.Modules.Common.DTOs;

namespace FateConnect.Api.Tests;

public class PagedContractTests
{
    [Theory]
    [InlineData(0, 10, 0)]
    [InlineData(1, 10, 1)]
    [InlineData(10, 10, 1)]
    [InlineData(11, 10, 2)]
    [InlineData(97, 10, 10)]
    [InlineData(100, 50, 2)]
    public void TotalPages_RoundsTheTotalOverThePageSizeUp(int total, int pageSize, int expected)
    {
        PagedResultDto<string> page = new()
        {
            Items = [],
            Page = 1,
            PageSize = pageSize,
            Total = total,
        };

        Assert.Equal(expected, page.TotalPages);
    }

    [Theory]
    [InlineData(null, 1)]
    [InlineData(0, 1)]
    [InlineData(-7, 1)]
    [InlineData(3, 3)]
    public void EffectivePage_NeverGoesBelowTheFirstPage(int? requested, int expected)
    {
        PagedFilterDto filter = new() { Page = requested };

        Assert.Equal(expected, filter.EffectivePage);
    }

    [Theory]
    [InlineData(null, 10)]
    [InlineData(0, 10)]
    [InlineData(-3, 10)]
    [InlineData(25, 25)]
    [InlineData(50, 50)]
    [InlineData(100000, 50)]
    public void EffectivePageSize_FallsBackToTheDefaultAndStopsAtTheCap(int? requested, int expected)
    {
        PagedFilterDto filter = new() { PageSize = requested };

        Assert.Equal(expected, filter.EffectivePageSize);
    }

    [Theory]
    [InlineData(1, 10, 0)]
    [InlineData(2, 10, 10)]
    [InlineData(3, 25, 50)]
    public void ItemsToSkip_LeavesOutEveryPageBeforeTheRequestedOne(int page, int pageSize, int expected)
    {
        PagedFilterDto filter = new() { Page = page, PageSize = pageSize };

        Assert.Equal(expected, filter.ItemsToSkip);
    }
}
