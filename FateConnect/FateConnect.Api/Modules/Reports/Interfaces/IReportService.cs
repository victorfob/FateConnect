namespace FateConnect.Api.Modules.Reports.Interfaces;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Reports.DTOs;

public interface IReportService
{
    Task<ReadReportDto> CreateAsync(CreateReportDto dto, int currentUserId);
    Task<PagedResultDto<ReadReportDto>> GetAllAsync(ReportFilterDto filter);
    Task<PagedResultDto<ReadReportDto>> GetReportedByAsync(ReportFilterDto filter, int reporterId);
    Task<ReadReportDto?> GetByIdAsync(Guid id);
    Task<string?> GetStoredImageNameAsync(Guid id, int currentUserId, bool isAdministrator);
    Task<ReadReportDto?> UpdateStatusAsync(Guid id, UpdateReportStatusDto dto);
}
