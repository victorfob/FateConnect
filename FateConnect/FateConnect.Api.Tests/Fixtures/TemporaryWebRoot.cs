using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace FateConnect.Api.Tests.Fixtures;

public sealed class TemporaryWebRoot(string webRootPath) : IWebHostEnvironment
{
    public string WebRootPath { get; set; } = webRootPath;
    public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    public string ContentRootPath { get; set; } = webRootPath;
    public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    public string EnvironmentName { get; set; } = "Test";
    public string ApplicationName { get; set; } = "FateConnect.Api";
}
