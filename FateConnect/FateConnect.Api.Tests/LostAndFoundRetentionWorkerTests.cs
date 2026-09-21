using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.LostAndFound.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace FateConnect.Api.Tests;

public sealed class LostAndFoundRetentionWorkerTests
{
    private sealed class RecordingRetentionService(bool throwsOnSweep = false) : ILostAndFoundRetentionService
    {
        private readonly TaskCompletionSource _firstSweep = new();

        public Task FirstSweep => _firstSweep.Task;

        public int Sweeps { get; private set; }

        public Task SweepAsync()
        {
            Sweeps++;
            _firstSweep.TrySetResult();

            if (throwsOnSweep)
                throw new InvalidOperationException("o banco recusou a varredura");

            return Task.CompletedTask;
        }
    }

    private sealed class SingleServiceScopeFactory(ILostAndFoundRetentionService retention)
        : IServiceScopeFactory, IServiceScope, IServiceProvider
    {
        public IServiceScope CreateScope() => this;

        public IServiceProvider ServiceProvider => this;

        public object? GetService(Type serviceType)
        {
            if (serviceType == typeof(ILostAndFoundRetentionService))
                return retention;

            return null;
        }

        public void Dispose() => GC.SuppressFinalize(this);
    }

    private static LostAndFoundRetentionWorker WorkerOver(ILostAndFoundRetentionService retention) =>
        new(new SingleServiceScopeFactory(retention), NullLogger<LostAndFoundRetentionWorker>.Instance);

    [Fact]
    public async Task Worker_WhenTheHostStarts_RunsOneSweepBeforeWaitingForTheNextCycle()
    {
        RecordingRetentionService retention = new();
        using LostAndFoundRetentionWorker worker = WorkerOver(retention);

        await worker.StartAsync(CancellationToken.None);
        await retention.FirstSweep;
        await worker.StopAsync(CancellationToken.None);

        Assert.Equal(1, retention.Sweeps);
        Assert.True(worker.ExecuteTask?.IsCompletedSuccessfully);
    }

    [Fact]
    public async Task Worker_WhenASweepThrows_KeepsTheLoopAliveInsteadOfStoppingTheHost()
    {
        RecordingRetentionService retention = new(throwsOnSweep: true);
        using LostAndFoundRetentionWorker worker = WorkerOver(retention);

        await worker.StartAsync(CancellationToken.None);
        await retention.FirstSweep;
        await worker.StopAsync(CancellationToken.None);

        Assert.Equal(1, retention.Sweeps);
        Assert.True(worker.ExecuteTask?.IsCompletedSuccessfully);
    }
}
