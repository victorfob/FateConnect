namespace FateConnect.Api.Modules.Rides.Services;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Extensions;
using Microsoft.Extensions.Logging;

public partial class RideService(
    IRideRepository repository,
    IHolidayCalendar holidays,
    TimeProvider clock,
    ILogger<RideService> logger
) : IRideService
{
    public async Task<ReadRideDto> CreateAsync(CreateRideDto dto, int currentUserId)
    {
        var ride = new Ride(
            dto.Destination,
            dto.DepartureDate,
            dto.DepartureTime,
            dto.RideType,
            dto.VehicleType,
            currentUserId,
            dto.Description
        );

        ride.ChangeRepetition(dto.Frequency, dto.RepeatUntil, holidays);

        await repository.AddAsync(ride);

        LogRideCreated(logger, ride.Id);

        return MapToReadDto(ride, currentUserId);
    }

    public async Task<PagedResultDto<ReadRideDto>> GetAllAsync(FilterRideDto filter, int currentUserId)
    {
        int? userIdToFilter = filter.OnlyMine == true ? currentUserId : null;

        (IReadOnlyList<Ride> rides, int total) = await repository.GetAllAsync(filter, userIdToFilter);

        LogRidesRetrieved(logger, rides.Count);

        return new PagedResultDto<ReadRideDto>
        {
            Items = [.. rides.Select(ride => MapToReadDto(ride, currentUserId))],
            Page = filter.EffectivePage,
            PageSize = filter.EffectivePageSize,
            Total = total,
        };
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

        ride.UpdateBasicAttributes(
            dto.Destination,
            dto.RideType,
            dto.VehicleType,
            dto.Description
        );

        bool hasScheduleChanged = dto.DepartureDate.HasValue
            || dto.DepartureTime.HasValue
            || dto.Frequency.HasValue
            || dto.RepeatUntil.HasValue;

        if (hasScheduleChanged)
            ride.Reschedule(
                new RideScheduleChange(dto.DepartureDate, dto.DepartureTime, dto.Frequency, dto.RepeatUntil),
                DateTimeUtils.NowInProductTimeZone(clock),
                holidays);

        await repository.UpdateAsync(ride);

        LogRideUpdated(logger, id);

        return MapToReadDto(ride, currentUserId);
    }

    public async Task<bool> DeleteAsync(Guid id, int currentUserId)
    {
        var ride = await repository.GetByIdAsync(id);

        if (ride is null)
        {
            LogRideDeactivationFailed(logger, id);
            return false;
        }

        EnsureRideIsDrivenBy(ride, currentUserId);

        ride.Deactivate();

        await repository.UpdateAsync(ride);

        LogRideDeactivated(logger, id);
        return true;
    }

    private void EnsureRideIsDrivenBy(Ride ride, int currentUserId)
    {
        if (ride.IsDrivenBy(currentUserId))
            return;

        LogRideChangeRefused(logger, currentUserId, ride.Id);

        throw new RideNotDrivenByUserException();
    }

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
