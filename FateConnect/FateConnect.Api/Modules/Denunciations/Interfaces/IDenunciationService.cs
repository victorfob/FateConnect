namespace FateConnect.Api.Modules.Denunciations.Interfaces;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Denunciations.DTOs;
using System;
using System.Threading.Tasks;

public interface IDenunciationService
{
    Task<ReadDenunciationDto> CreateAsync(CreateDenunciationDto dto, int currentUserId);
    Task<PagedResultDto<ReadDenunciationDto>> GetAllAsync(DenunciationFilterDto filter);
    Task<ReadDenunciationDto?> GetByIdAsync(Guid id);
    Task<ReadDenunciationDto?> UpdateStatusAsync(Guid id, UpdateDenunciationStatusDto dto);
}
