namespace FateConnect.Api.Modules.Rides.Controllers;

using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
[Authorize]
[SwaggerTag("Holidays")]
public class HolidaysController(IHolidayCalendar holidayCalendar) : ControllerBase
{
    [HttpGet]
    [SwaggerOperation(Summary = "Get the holidays of a year", Description = "Returns the national, São Paulo state and Sorocaba municipal holidays of the year, sorted. Rides that repeat skip them.")]
    public ActionResult<IReadOnlyList<DateOnly>> GetAll([FromQuery] HolidaysQueryDto query)
    {
        return Ok(holidayCalendar.HolidaysIn(query.Year!.Value));
    }
}
