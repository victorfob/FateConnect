using System.ComponentModel.DataAnnotations;
using System.Text;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Common.Services;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Common.Validators;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.LostAndFound.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;

namespace FateConnect.Api.Tests;

public sealed class ImageStorageTests : IDisposable
{
    private readonly string _webRoot = Path.Combine(Path.GetTempPath(), $"fateconnect-uploads-{Guid.NewGuid():N}");

    private sealed class TemporaryWebRoot(string webRootPath) : IWebHostEnvironment
    {
        public string WebRootPath { get; set; } = webRootPath;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = webRootPath;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string EnvironmentName { get; set; } = "Test";
        public string ApplicationName { get; set; } = "FateConnect.Api";
    }

    private static FormFile FileOf(string contentType, int sizeInBytes = 12, string fileName = "foto.png")
    {
        MemoryStream content = new(Encoding.UTF8.GetBytes(new string('x', sizeInBytes)));

        return new FormFile(content, 0, content.Length, "Image", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType,
        };
    }

    private static ValidationResult? Validate(IFormFile? image) =>
        new ValidImageAttribute().GetValidationResult(image, new ValidationContext(new object()));

    private static StorageService ServiceOn(string webRoot) =>
        new(new TemporaryWebRoot(webRoot), NullLogger<StorageService>.Instance);

    private sealed class RefusingRepository : ILostAndFoundRepository
    {
        public Task<(IReadOnlyList<LostAndFoundRecord> Items, int Total)> GetAllAsync(
            FilterLostAndFoundDto filter, int? currentUserId = null) =>
            throw new NotSupportedException();

        public Task<LostAndFoundRecord?> GetByIdAsync(Guid id, bool forChange = true) =>
            throw new NotSupportedException();

        public Task<LostAndFoundRecord> AddAsync(LostAndFoundRecord lostAndFoundRecord) =>
            throw new DbUpdateException("o banco recusou o registro");

        public Task SaveChangesAsync() => throw new NotSupportedException();
    }

    public void Dispose()
    {
        if (Directory.Exists(_webRoot))
            Directory.Delete(_webRoot, recursive: true);
    }

    [Theory]
    [InlineData("image/jpeg", ".jpg")]
    [InlineData("image/png", ".png")]
    [InlineData("image/webp", ".webp")]
    [InlineData("IMAGE/PNG", ".png")]
    public void ExtensionFor_ASupportedContentType_AnswersItsExtension(string contentType, string extension)
    {
        Assert.True(ImageContentTypes.IsSupported(contentType));
        Assert.Equal(extension, ImageContentTypes.ExtensionFor(contentType));
    }

    [Theory]
    [InlineData("text/html")]
    [InlineData("image/gif")]
    [InlineData("image/jpg")]
    public void ExtensionFor_AnUnsupportedContentType_IsRefused(string contentType)
    {
        Assert.False(ImageContentTypes.IsSupported(contentType));

        InvalidImageException exception =
            Assert.Throws<InvalidImageException>(() => ImageContentTypes.ExtensionFor(contentType));

        Assert.Equal(ImageContentTypes.UnsupportedMessage, exception.Message);
    }

    [Fact]
    public void ValidImage_WithASupportedImage_IsAccepted()
    {
        Assert.Equal(ValidationResult.Success, Validate(FileOf("image/png")));
    }

    [Fact]
    public void ValidImage_WithoutAFile_IsAccepted()
    {
        Assert.Equal(ValidationResult.Success, Validate(null));
    }

    [Fact]
    public void ValidImage_WithAnEmptyFile_IsRefused()
    {
        ValidationResult? result = Validate(FileOf("image/png", sizeInBytes: 0));

        Assert.Equal("A imagem enviada está vazia ou corrompida.", result?.ErrorMessage);
    }

    [Fact]
    public void ValidImage_WithAFileAboveTheSizeLimit_IsRefused()
    {
        ValidationResult? result = Validate(FileOf("image/png", sizeInBytes: 5 * 1024 * 1024 + 1));

        Assert.Equal("O tamanho da imagem não pode ultrapassar 5MB.", result?.ErrorMessage);
    }

    [Fact]
    public void ValidImage_WithAFileThatIsNotAnImage_IsRefused()
    {
        ValidationResult? result = Validate(FileOf("text/html", fileName: "payload.html"));

        Assert.Equal(ImageContentTypes.UnsupportedMessage, result?.ErrorMessage);
    }

    [Fact]
    public async Task UploadImage_NamesTheFileByTheContentTypeAndNotByWhatWasSent()
    {
        StorageService service = ServiceOn(_webRoot);

        string path = await service.UploadImageAsync(FileOf("image/png", fileName: "payload.html"), EnumStorageContainer.LostAndFound);

        Assert.StartsWith("uploads/lostandfound/", path, StringComparison.Ordinal);
        Assert.EndsWith(".png", path, StringComparison.Ordinal);
        Assert.True(File.Exists(Path.Combine(_webRoot, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar))));
    }

    [Fact]
    public async Task UploadImage_WithAnUnsupportedContentType_WritesNothing()
    {
        StorageService service = ServiceOn(_webRoot);

        await Assert.ThrowsAsync<InvalidImageException>(
            () => service.UploadImageAsync(FileOf("text/html"), EnumStorageContainer.LostAndFound));

        Assert.False(Directory.Exists(Path.Combine(_webRoot, "uploads", "lostandfound")));
    }

    [Fact]
    public async Task DeleteImage_RemovesTheFileItStored()
    {
        StorageService service = ServiceOn(_webRoot);
        string path = await service.UploadImageAsync(FileOf("image/webp"), EnumStorageContainer.LostAndFound);
        string physicalPath = Path.Combine(_webRoot, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

        await service.DeleteImageAsync(path);

        Assert.False(File.Exists(physicalPath));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task DeleteImage_WithoutAPath_DoesNothing(string path)
    {
        StorageService service = ServiceOn(_webRoot);

        await service.DeleteImageAsync(path);

        Assert.False(Directory.Exists(_webRoot));
    }

    [Fact]
    public async Task DeleteImage_OfAFileThatIsNoLongerThere_DoesNothing()
    {
        StorageService service = ServiceOn(_webRoot);

        await service.DeleteImageAsync("uploads/lostandfound/inexistente.png");

        Assert.False(Directory.Exists(_webRoot));
    }

    [Fact]
    public async Task DeleteImage_TheFileSystemRefuses_KeepsGoingAndLeavesTheFile()
    {
        if (OperatingSystem.IsWindows())
            return;

        StorageService service = ServiceOn(_webRoot);
        string path = await service.UploadImageAsync(FileOf("image/png"), EnumStorageContainer.LostAndFound);
        string physicalPath = Path.Combine(_webRoot, path.Replace('/', Path.DirectorySeparatorChar));
        string folder = Path.GetDirectoryName(physicalPath)!;

        File.SetUnixFileMode(folder, UnixFileMode.UserRead | UnixFileMode.UserExecute);

        try
        {
            await service.DeleteImageAsync(path);

            Assert.True(File.Exists(physicalPath));
        }
        finally
        {
            File.SetUnixFileMode(folder, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
        }
    }

    [Fact]
    public async Task CreateItem_WhenTheDatabaseRefusesIt_LeavesNoFileBehind()
    {
        StorageService storage = ServiceOn(_webRoot);
        LostAndFoundService service = new(new RefusingRepository(), storage, NullLogger<LostAndFoundService>.Instance);

        CreateLostAndFoundDto dto = new()
        {
            Name = "Garrafa térmica azul",
            LostAndFoundType = EnumLostAndFoundType.Lost,
            Place = "Biblioteca do bloco B",
            OcurredOn = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
            Image = FileOf("image/png"),
        };

        await Assert.ThrowsAsync<DbUpdateException>(() => service.CreateAsync(dto, 1));

        Assert.Empty(Directory.GetFiles(Path.Combine(_webRoot, "uploads", "lostandfound")));
    }
}
