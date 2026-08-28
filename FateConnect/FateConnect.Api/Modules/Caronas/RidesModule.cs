namespace FateConnect.Api.Modules.Rides;

using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Rides.Repositories;
using FateConnect.Api.Modules.Rides.Services;
using Microsoft.Extensions.DependencyInjection;

public static class RidesModule
{
    public static IServiceCollection AddRidesModule(this IServiceCollection services)
    {
        services.AddScoped<IRideRepository, RideRepository>();
        services.AddScoped<IRideService, RideService>();

        return services;
    }
}
