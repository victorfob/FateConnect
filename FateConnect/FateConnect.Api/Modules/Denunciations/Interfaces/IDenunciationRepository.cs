namespace FateConnect.Api.Modules.Denunciations.Interfaces;

using FateConnect.Api.Modules.Denunciations.DTOs;
using FateConnect.Api.Modules.Denunciations.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IDenunciationRepository
{
    Task<(IReadOnlyList<Denunciation> Items, int Total)> GetAllAsync(DenunciationFilterDto filter);
    Task<Denunciation?> GetByIdAsync(Guid id);
    Task<Denunciation> AddAsync(Denunciation denunciation);
    Task UpdateAsync(Denunciation denunciation);
}
