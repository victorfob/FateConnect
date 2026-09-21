namespace FateConnect.Api.Modules.Denunciations.Interfaces;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Denunciations.DTOs;
using System;
using System.Threading.Tasks;

public interface IDenunciationService
{
    Task<ReadDenunciationDto> CreateAsync(CreateDenunciationDto dto, int currentUserId);
    Task<PagedResultDto<ReadDenunciationDto>> GetAllAsync(DenunciationFilterDto filter);
    Task<PagedResultDto<ReadDenunciationDto>> GetReportedByAsync(DenunciationFilterDto filter, int reporterId);
    Task<ReadDenunciationDto?> GetByIdAsync(Guid id);
    Task<string?> GetStoredImageNameAsync(Guid id, int currentUserId, bool isAdministrator);
    Task<ReadDenunciationDto?> UpdateStatusAsync(Guid id, UpdateDenunciationStatusDto dto);
}
