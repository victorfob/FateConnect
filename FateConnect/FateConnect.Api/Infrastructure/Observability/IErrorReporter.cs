namespace FateConnect.Api.Infrastructure.Observability;

using System;
using Microsoft.AspNetCore.Http;

public interface IErrorReporter
{
    void Report(Exception exception, HttpContext context);
}
