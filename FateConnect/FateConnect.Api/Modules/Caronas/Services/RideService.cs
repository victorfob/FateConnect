namespace FateConnect.Api.Modules.Rides.Services;

using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Interfaces;
using Microsoft.Extensions.Logging;

public partial class RideService(
    IRideRepository repository,
    ILogger<RideService> logger
) : IRideService
{
    public async Task<ReadRideDto> CreateAsync(CreateRideDto dto)
    {
        var ride = new Ride(
            dto.AvailableSeats,
            dto.Destination,
            dto.DepartureDate,
            dto.DepartureTime,
            dto.RideType,
            dto.Description
        );

        await repository.AddAsync(ride);

        LogRideCreated(logger, ride.Id);

        return MapToReadDto(ride);
    }

    public async Task<IEnumerable<ReadRideDto>> GetAllAsync(FilterRideDto filter)
    {
        var rides = await repository.GetAllAsync(
            filter
        );

        var rideList = rides as IReadOnlyCollection<Ride> ?? rides.ToList();
        LogRidesRetrieved(logger, rideList.Count);

        return rideList.Select(MapToReadDto);
    }

    public async Task<ReadRideDto?> GetByIdAsync(Guid id)
    {
        var ride = await repository.GetByIdAsync(id);

        if (ride is null)
        {
            LogRideNotFound(logger, id);
            return null;
        }

        LogRideFound(logger, id);

        return MapToReadDto(ride);
    }

    public async Task<ReadRideDto?> UpdateAsync(Guid id, UpdateRideDto dto)
    {
        var ride = await repository.GetByIdAsync(id);

        if (ride is null)
        {
            LogRideNotFound(logger, id);
            return null;
        }

        ride.UpdateBasicAttributes(
            dto.AvailableSeats,
            dto.Destination,
            dto.RideType,
            dto.Description
        );

        bool hasScheduleChanged = dto.DepartureDate.HasValue || dto.DepartureTime.HasValue;

        if (hasScheduleChanged)
            ride.ChangeDepartureSchedule(dto.DepartureDate, dto.DepartureTime);

        await repository.UpdateAsync(ride);

        LogRideUpdated(logger, id);

        return MapToReadDto(ride);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var ride = await repository.GetByIdAsync(id);

        if (ride is null)
        {
            LogRideDeactivationFailed(logger, id);
            return false;
        }

        ride.Deactivate();

        await repository.UpdateAsync(ride);

        LogRideDeactivated(logger, id);
        return true;
    }

    private static ReadRideDto MapToReadDto(Ride ride) =>
        new(
            ride.Id,
            ride.AvailableSeats,
            ride.Destination,
            ride.DepartureDate,
            ride.DepartureTime,
            ride.CreatedAt,
            ride.RideType,
            ride.Description,
            ride.IsActive
        );

}
