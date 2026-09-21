namespace FateConnect.Api.Modules.LostAndFound.Services;

using FateConnect.Api.Modules.LostAndFound.Constants;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public sealed partial class LostAndFoundRetentionWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<LostAndFoundRetentionWorker> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using PeriodicTimer timer = new(LostAndFoundRetention.SweepInterval);

        try
        {
            do
            {
                await SweepAsync();
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException)
        {
            LogSweepLoopStopped(logger);
        }
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
