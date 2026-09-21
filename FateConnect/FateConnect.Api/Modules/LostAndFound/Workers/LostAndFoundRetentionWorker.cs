namespace FateConnect.Api.Modules.LostAndFound.Workers;

using FateConnect.Api.Modules.LostAndFound.Constants;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public sealed partial class LostAndFoundRetentionWorker(
    IServiceScopeFactory scopeFactory,
    TimeProvider timeProvider,
    ILogger<LostAndFoundRetentionWorker> logger
) : BackgroundService
{
    private static readonly TimeSpan OneDay = TimeSpan.FromDays(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(DelayUntilNextSweep(), timeProvider, stoppingToken);

                await SweepAsync();
            }
        }
        catch (OperationCanceledException)
        {
            LogSweepLoopStopped(logger);
        }
    }

    private TimeSpan DelayUntilNextSweep()
    {
        DateTimeOffset now = timeProvider.GetUtcNow();

        DateTimeOffset sweepTimeToday = new(
            DateOnly.FromDateTime(now.UtcDateTime),
            LostAndFoundRetention.SweepTimeOfDayUtc,
            TimeSpan.Zero);

        if (sweepTimeToday > now)
            return sweepTimeToday - now;

        return sweepTimeToday.Add(OneDay) - now;
    }

    private async Task SweepAsync()
    {
        try
        {
            using IServiceScope scope = scopeFactory.CreateScope();

            ILostAndFoundRetentionService retention =
                scope.ServiceProvider.GetRequiredService<ILostAndFoundRetentionService>();

            await retention.SweepAsync();
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            LogSweepFailed(logger, exception);
        }
    }
}
