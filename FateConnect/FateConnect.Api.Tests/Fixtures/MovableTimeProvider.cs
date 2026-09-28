namespace FateConnect.Api.Tests.Fixtures;

public sealed class MovableTimeProvider : TimeProvider
{
    public DateTimeOffset Now { get; set; }

    public MovableTimeProvider(DateTimeOffset now)
    {
        Now = now;
    }

    public override DateTimeOffset GetUtcNow() => Now;
}
