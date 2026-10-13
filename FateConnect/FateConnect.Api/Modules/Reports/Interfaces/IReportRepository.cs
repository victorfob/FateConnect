namespace FateConnect.Api.Modules.Reports.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Reports.DTOs;
using FateConnect.Api.Modules.Reports.Entities;

public interface IReportRepository
{
    Task<(
        IReadOnlyList<Report> Items,
        int Total)> GetAllAsync(ReportFilterDto filter, int? reporterId = null);
    Task<Report?> GetByIdAsync(Guid id, bool forChange = true);
    Task<Report> AddAsync(Report report);
    Task SaveChangesAsync();
}
