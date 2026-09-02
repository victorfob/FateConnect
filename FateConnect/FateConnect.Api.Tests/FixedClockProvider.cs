namespace FateConnect.Api.Tests;

public sealed class FixedClockProvider : IServiceProvider
{
    private readonly TimeProvider _clock;

    public FixedClockProvider(TimeProvider clock)
    {
        _clock = clock;
    }

    public object? GetService(Type serviceType)
    {
        if (serviceType == typeof(TimeProvider))
            return _clock;

        return null;
    }
}
