namespace FateConnect.Api.Modules.Rides.Controllers;

using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
[Authorize]
[SwaggerTag("Holidays on which no ride departs.")]
public class HolidaysController(IHolidayCalendar holidayCalendar) : ControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        OperationId = "ListHolidays",
        Summary = "List the holidays of a year",
        Description = "Returns the national, São Paulo state and Sorocaba municipal holidays of the year, sorted. " +
            "No ride departs on them: a one-off ride on a holiday is refused, and a repeated ride skips it.")]
    public ActionResult<IReadOnlyList<DateOnly>> GetAll([FromQuery] HolidaysQueryDto query)
    {
        return Ok(holidayCalendar.HolidaysIn(query.Year!.Value));
    }
}
