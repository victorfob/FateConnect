namespace FateConnect.Api.Modules.Rides.Controllers;

using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
[Authorize]
[SwaggerTag("Ride Management")]
public class RidesController(IRideService rideService) : ControllerBase
{
    [HttpGet]
    [SwaggerOperation(Summary = "Get active rides", Description = "Returns a page of active rides whose departure has not passed yet, matching the optional filters.")]
    public async Task<ActionResult<PagedResultDto<ReadRideDto>>> GetAllAsync([FromQuery] FilterRideDto filters)
    {
        var rides = await rideService.GetAllAsync(filters, User.GetUserId());
        return Ok(rides);
    }

    [HttpGet("{id:guid}", Name = "GetRideById")]
    [SwaggerOperation(Summary = "Get ride by ID", Description = "Returns a specific ride by its ID, provided it is active.")]
    public async Task<ActionResult<ReadRideDto>> GetByIdAsync(Guid id)
    {
        var ride = await rideService.GetByIdAsync(id, User.GetUserId());

        if (ride is null)
            return NotFound();

        return Ok(ride);
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Create a new ride", Description = "Registers a new ride in the system, offered by the authenticated user.")]
    public async Task<ActionResult<ReadRideDto>> CreateAsync(CreateRideDto dto)
    {
        var newRide = await rideService.CreateAsync(dto, User.GetUserId());

        return CreatedAtRoute(
            routeName: "GetRideById",
            routeValues: new { id = newRide.Id },
            value: newRide
        );
    }

    [HttpPut("{id:guid}")]
    [SwaggerOperation(Summary = "Update an existing ride", Description = "Updates ride details such as available seats, destination, or departure time. Only the user who offered the ride can change it.")]
    public async Task<ActionResult<ReadRideDto>> UpdateAsync(Guid id, UpdateRideDto dto)
    {
        var updatedRide = await rideService.UpdateAsync(id, dto, User.GetUserId());

        if (updatedRide is null)
            return NotFound();

        return Ok(updatedRide);
    }

    [HttpDelete("{id:guid}")]
    [SwaggerOperation(Summary = "Deactivate a ride", Description = "Sets the ride active status to false. Only the user who offered the ride can do it.")]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        var isDeactivated = await rideService.DeleteAsync(id, User.GetUserId());

        if (!isDeactivated)
            return NotFound();

        return NoContent();
    }
}
