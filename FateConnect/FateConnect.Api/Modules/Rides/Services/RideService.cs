namespace FateConnect.Api.Modules.Rides.Services;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Users.Extensions;
using MassTransit;
using Microsoft.Extensions.Logging;

public partial class RideService(
    IRideRepository repository,
    IHolidayCalendar holidays,
    TimeProvider clock,
    IPublishEndpoint publishEndpoint,
    ILogger<RideService> logger
) : IRideService
{
    public async Task<ReadRideDto> CreateAsync(CreateRideDto dto, int currentUserId)
    {
        var ride = new Ride(
            dto.Destination,
            new RideFirstDeparture(dto.DepartureDate, dto.DepartureTime),
            dto.RideType,
            dto.VehicleType,
            currentUserId,
            clock.GetUtcNow().UtcDateTime,
            dto.Description
        );

        ride.ChangeRepetition(dto.Frequency, dto.RepeatUntil, holidays);

        await publishEndpoint.Publish(new RideCreatedEvent(
            RideId: ride.Id,
            DriverId: currentUserId,
            Destination: ride.Destination
        ));

        await repository.AddAsync(ride);

        LogRideCreated(logger, ride.Id);

        return MapToReadDto(ride, currentUserId);
    }

    public async Task<PagedResultDto<ReadRideDto>> GetAllAsync(RideFilterDto filter, int currentUserId)
    {
        int? userIdToFilter = filter.OnlyMine == true ? currentUserId : null;

        (IReadOnlyList<Ride> rides, int total) = await repository.GetAllAsync(filter, userIdToFilter);

        LogRidesRetrieved(logger, rides.Count);

        return filter.ToResult<ReadRideDto>([.. rides.Select(ride => MapToReadDto(ride, currentUserId))], total);
    }

    public async Task<ReadRideDto?> GetByIdAsync(Guid id, int currentUserId)
    {
        var ride = await repository.GetByIdAsync(id);

        if (ride is null)
        {
            LogRideNotFound(logger, id);
            return null;
        }

        LogRideFound(logger, id);

        return MapToReadDto(ride, currentUserId);
    }

    public async Task<ReadRideDto?> UpdateAsync(Guid id, UpdateRideDto dto, int currentUserId)
    {
        var ride = await repository.GetByIdAsync(id);

        if (ride is null)
        {
            LogRideNotFound(logger, id);
            return null;
        }

        EnsureRideIsDrivenBy(ride, currentUserId);

        DateTime now = clock.GetUtcNow().UtcDateTime;

        ride.UpdateBasicAttributes(
            dto.Destination,
            dto.RideType,
            dto.VehicleType,
            dto.Description,
            now
        );

        bool hasScheduleChanged = dto.DepartureDate.HasValue
            || dto.DepartureTime.HasValue
            || dto.Frequency.HasValue
            || dto.RepeatUntil.HasValue;

        if (hasScheduleChanged)
            ride.Reschedule(
                new RideScheduleChange(dto.DepartureDate, dto.DepartureTime, dto.Frequency, dto.RepeatUntil),
                now,
                holidays);

        await repository.SaveChangesAsync();

        LogRideUpdated(logger, id);

        return MapToReadDto(ride, currentUserId);
    }

    public async Task<bool> DeactivateAsync(Guid id, int currentUserId)
    {
        var ride = await repository.GetByIdAsync(id);

        if (ride is null)
        {
            LogRideDeactivationFailed(logger, id);
            return false;
        }

        EnsureRideIsDrivenBy(ride, currentUserId);

        ride.Deactivate(clock.GetUtcNow().UtcDateTime);

        await repository.SaveChangesAsync();

        LogRideDeactivated(logger, id);
        return true;
    }

    private void EnsureRideIsDrivenBy(Ride ride, int currentUserId) =>
        OwnershipGuard.EnsureOwnedBy<RideNotDrivenByUserException>(
            ride.IsDrivenBy(currentUserId),
            () => LogRideChangeRefused(logger, currentUserId, ride.Id));

    private ReadRideDto MapToReadDto(Ride ride, int currentUserId) =>
        new(
            ride.Id,
            ride.Destination,
            ride.NextDepartureDate(DateTimeUtils.NowInProductTimeZone(clock)),
            ride.DepartureTime,
            ride.CreatedAt,
            ride.RideType,
            ride.VehicleType,
            ride.Description,
            ride.Driver.ToContactDto(),
            ride.IsDrivenBy(currentUserId),
            ride.Frequency,
            ride.RepeatUntil
        );
}
