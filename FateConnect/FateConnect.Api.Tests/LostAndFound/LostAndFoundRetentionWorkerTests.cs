using FateConnect.Api.Modules.LostAndFound.Constants;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.LostAndFound.Workers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Time.Testing;

namespace FateConnect.Api.Tests.LostAndFound;

public sealed class LostAndFoundRetentionWorkerTests
{
    private static readonly DateTimeOffset OneHourBeforeSweepTime =
        new(2026, 9, 21, LostAndFoundRetention.SweepTimeOfDayUtc.Hour - 1, 0, 0, TimeSpan.Zero);

    private static readonly TimeSpan OneDay = TimeSpan.FromDays(1);

    private sealed class RecordingRetentionService(bool throwsOnSweep = false) : ILostAndFoundRetentionService
    {
        private readonly TaskCompletionSource[] _reached = [new(), new(), new()];

        public int Sweeps { get; private set; }

        public Task Reached(int sweeps) => _reached[sweeps - 1].Task;

        public Task SweepAsync()
        {
            Sweeps++;

            if (Sweeps <= _reached.Length)
                _reached[Sweeps - 1].TrySetResult();

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

    private static LostAndFoundRetentionWorker WorkerOver(
        ILostAndFoundRetentionService retention,
        TimeProvider clock) =>
        new(new SingleServiceScopeFactory(retention), clock, NullLogger<LostAndFoundRetentionWorker>.Instance);

    [Fact]
    public async Task Worker_WhenTheHostStarts_SweepsNothingUntilTheSweepTimeArrives()
    {
        FakeTimeProvider clock = new(OneHourBeforeSweepTime);
        RecordingRetentionService retention = new();
        using LostAndFoundRetentionWorker worker = WorkerOver(retention, clock);

        await worker.StartAsync(CancellationToken.None);
        clock.Advance(TimeSpan.FromMinutes(59));

        Assert.Equal(0, retention.Sweeps);

        await worker.StopAsync(CancellationToken.None);
    }

    [Fact]
    public async Task Worker_WhenTheSweepTimeArrives_RunsOneSweep()
    {
        FakeTimeProvider clock = new(OneHourBeforeSweepTime);
        RecordingRetentionService retention = new();
        using LostAndFoundRetentionWorker worker = WorkerOver(retention, clock);
        await worker.StartAsync(CancellationToken.None);

        clock.Advance(TimeSpan.FromHours(1));
        await retention.Reached(1);

        Assert.Equal(1, retention.Sweeps);
        await worker.StopAsync(CancellationToken.None);
    }

    [Fact]
    public async Task Worker_WhenADayPassesAfterASweep_RunsTheNextOne()
    {
        FakeTimeProvider clock = new(OneHourBeforeSweepTime);
        RecordingRetentionService retention = new();
        using LostAndFoundRetentionWorker worker = WorkerOver(retention, clock);
        await worker.StartAsync(CancellationToken.None);
        clock.Advance(TimeSpan.FromHours(1));
        await retention.Reached(1);

        clock.Advance(OneDay);
        await retention.Reached(2);

        Assert.Equal(2, retention.Sweeps);
        await worker.StopAsync(CancellationToken.None);
    }

    [Fact]
    public async Task Worker_WhenTheHostStartsAfterTheSweepTime_WaitsForTheNextDay()
    {
        FakeTimeProvider clock = new(OneHourBeforeSweepTime.AddHours(2));
        RecordingRetentionService retention = new();
        using LostAndFoundRetentionWorker worker = WorkerOver(retention, clock);
        await worker.StartAsync(CancellationToken.None);

        clock.Advance(OneDay - TimeSpan.FromHours(2));

        Assert.Equal(0, retention.Sweeps);

        clock.Advance(TimeSpan.FromHours(1));
        await retention.Reached(1);

        Assert.Equal(1, retention.Sweeps);
        await worker.StopAsync(CancellationToken.None);
    }

    [Fact]
    public async Task Worker_WhenASweepThrows_KeepsTheLoopAliveForTheNextDay()
    {
        FakeTimeProvider clock = new(OneHourBeforeSweepTime);
        RecordingRetentionService retention = new(throwsOnSweep: true);
        using LostAndFoundRetentionWorker worker = WorkerOver(retention, clock);
        await worker.StartAsync(CancellationToken.None);
        clock.Advance(TimeSpan.FromHours(1));
        await retention.Reached(1);

        clock.Advance(OneDay);
        await retention.Reached(2);

        Assert.Equal(2, retention.Sweeps);
        await worker.StopAsync(CancellationToken.None);
    }
}
