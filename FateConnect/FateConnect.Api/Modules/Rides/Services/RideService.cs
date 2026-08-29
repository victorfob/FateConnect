namespace FateConnect.Api.Modules.Rides.Services;

using FateConnect.Api.Modules.Common.Entities;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Usuarios;
using Microsoft.Extensions.Logging;

public partial class RideService(
    IRideRepository repository,
    ILogger<RideService> logger
) : IRideService
{
    public async Task<ReadRideDto> CreateAsync(CreateRideDto dto, int currentUserId)
    {
        var ride = new Ride(
            dto.AvailableSeats,
            dto.Destination,
            dto.DepartureDate,
            dto.DepartureTime,
            dto.RideType,
            currentUserId,
            dto.Description
        );

        await repository.AddAsync(ride);

        LogRideCreated(logger, ride.Id);

        return MapToReadDto(ride, currentUserId);
    }

    public async Task<IEnumerable<ReadRideDto>> GetAllAsync(FilterRideDto filter, int currentUserId)
    {
        var rides = await repository.GetAllAsync(filter);

        LogRidesRetrieved(logger, rides.Count);

        return rides.Select(ride => MapToReadDto(ride, currentUserId));
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

    private static ReadRideDto MapToReadDto(Ride ride, int currentUserId) =>
        new(
            ride.Id,
            ride.AvailableSeats,
            ride.Destination,
            ride.DepartureDate,
            ride.DepartureTime,
            ride.CreatedAt,
            ride.RideType,
            ride.Description,
            MapDriverToDto(ride.Driver),
            ride.IsDrivenBy(currentUserId)
        );

    private static RideDriverDto MapDriverToDto(Usuario driver)
    {
        Contato contact = driver.Contatos.First();

        return new RideDriverDto(driver.NomeCompleto, contact.EmailContato, contact.Telefone);
    }

}
