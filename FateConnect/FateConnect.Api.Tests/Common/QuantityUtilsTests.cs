using FateConnect.Api.Modules.Common.Utils;

namespace FateConnect.Api.Tests.Common;

public class QuantityUtilsTests
{
    [Theory]
    [InlineData(1, "1 minuto")]
    [InlineData(30, "30 minutos")]
    public void Minutes_AgreesTheUnitWithTheCount(int count, string expected) =>
        Assert.Equal(expected, QuantityUtils.Minutes(count));

    [Theory]
    [InlineData(1, "1 hora")]
    [InlineData(8, "8 horas")]
    public void Hours_AgreesTheUnitWithTheCount(int count, string expected) =>
        Assert.Equal(expected, QuantityUtils.Hours(count));

    [Theory]
    [InlineData(1, "1 vez")]
    [InlineData(3, "3 vezes")]
    public void Times_AgreesTheUnitWithTheCount(int count, string expected) =>
        Assert.Equal(expected, QuantityUtils.Times(count));
}
