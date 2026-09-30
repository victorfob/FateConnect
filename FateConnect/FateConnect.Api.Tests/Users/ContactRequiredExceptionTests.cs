using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;

namespace FateConnect.Api.Tests.Users;

public class ContactRequiredExceptionTests
{
    private const EnumPublication UnknownPublication = (EnumPublication)99;

    [Fact]
    public void Constructor_ForAnUnknownPublication_IsRefused()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new ContactRequiredException(UnknownPublication));
    }
}
