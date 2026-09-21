namespace FateConnect.Api.Modules.LostAndFound.Constants;

public static class LostAndFoundRetention
{
    public static readonly TimeSpan InactivityBeforeArchiving = TimeSpan.FromDays(60);

    public static readonly TimeSpan TerminalStatusBeforeImageRemoval = TimeSpan.FromDays(30);

    public static readonly TimeOnly SweepTimeOfDayUtc = new(6, 0);
}
