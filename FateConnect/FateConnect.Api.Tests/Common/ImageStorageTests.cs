using System.ComponentModel.DataAnnotations;
using System.Text;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Common.Services;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Common.Validators;
using FateConnect.Api.Modules.Denunciations.DTOs;
using FateConnect.Api.Modules.Denunciations.Entities;
using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Denunciations.Interfaces;
using FateConnect.Api.Modules.Denunciations.Services;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.LostAndFound.Services;
using FateConnect.Api.Tests.Fixtures;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using SixLabors.ImageSharp;

namespace FateConnect.Api.Tests.Common;

public sealed class ImageStorageTests : IDisposable
{
    private readonly string _webRoot = Path.Combine(Path.GetTempPath(), $"fateconnect-uploads-{Guid.NewGuid():N}");

    private static FormFile FileOf(string contentType, byte[]? content = null, string fileName = "foto.png")
    {
        MemoryStream stream = new(content ?? TestImages.Png());

        return new FormFile(stream, 0, stream.Length, "Image", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType,
        };
    }

    private static FormFile FileOfSize(string contentType, int sizeInBytes) =>
        FileOf(contentType, Encoding.UTF8.GetBytes(new string('x', sizeInBytes)));

    private string PhysicalPathOf(string storedPath) =>
        Path.Combine(_webRoot, storedPath.Replace('/', Path.DirectorySeparatorChar));

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

        public Task<IReadOnlyList<LostAndFoundRecord>> GetOpenRecordsUntouchedSinceAsync(DateTime untouchedSince) =>
            throw new NotSupportedException();

        public Task<IReadOnlyList<LostAndFoundRecord>> GetTerminalRecordsWithImageSinceAsync(DateTime terminalSince) =>
            throw new NotSupportedException();

        public Task SaveChangesAsync() => throw new NotSupportedException();
    }

    private sealed class RefusingDenunciationRepository : IDenunciationRepository
    {
        public Task<(IReadOnlyList<Denunciation> Items, int Total)> GetAllAsync(
            DenunciationFilterDto filter, int? reporterId = null) =>
            throw new NotSupportedException();

        public Task<Denunciation?> GetByIdAsync(Guid id, bool forChange = true) =>
            throw new NotSupportedException();

        public Task<Denunciation> AddAsync(Denunciation denunciation) =>
            throw new DbUpdateException("o banco recusou a denúncia");

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
        ValidationResult? result = Validate(FileOfSize("image/png", 0));

        Assert.Equal("A imagem enviada está vazia ou corrompida.", result?.ErrorMessage);
    }

    [Fact]
    public void ValidImage_WithAFileAboveTheSizeLimit_IsRefused()
    {
        ValidationResult? result = Validate(FileOfSize("image/png", 5 * 1024 * 1024 + 1));

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
    public async Task UploadImage_WritesTheOriginalAndAThumbnailWhoseShortestSideFitsTheScreen()
    {
        StorageService service = ServiceOn(_webRoot);

        string path = await service.UploadImageAsync(
            FileOf("image/png", TestImages.Png(600, 400)), EnumStorageContainer.LostAndFound);

        string thumbnailPath = UploadsLocation.ThumbnailOf(path);
        using Image original = await Image.LoadAsync(PhysicalPathOf(path));
        using Image thumbnail = await Image.LoadAsync(PhysicalPathOf(thumbnailPath));

        Assert.Equal((600, 400), (original.Width, original.Height));
        Assert.Equal((432, ImageVariants.ThumbnailEdgeInPixels), (thumbnail.Width, thumbnail.Height));
        Assert.Equal("image/webp", thumbnail.Metadata.DecodedImageFormat?.DefaultMimeType);
    }

    [Fact]
    public async Task UploadImage_SmallerThanTheThumbnail_KeepsItsSize()
    {
        StorageService service = ServiceOn(_webRoot);

        string path = await service.UploadImageAsync(FileOf("image/png", TestImages.Png(40, 30)), EnumStorageContainer.LostAndFound);

        using Image thumbnail = await Image.LoadAsync(PhysicalPathOf(UploadsLocation.ThumbnailOf(path)));

        Assert.Equal((40, 30), (thumbnail.Width, thumbnail.Height));
    }

    [Fact]
    public async Task UploadImage_TakenWithAPhone_AppliesTheRotationAndDropsTheMetadata()
    {
        StorageService service = ServiceOn(_webRoot);
        byte[] photo = TestImages.JpegTakenWithAPhone(600, 400, TestImages.RotatedClockwise);

        string path = await service.UploadImageAsync(FileOf("image/jpeg", photo, "foto.jpg"), EnumStorageContainer.Denunciation);

        using Image original = await Image.LoadAsync(PhysicalPathOf(path));
        using Image thumbnail = await Image.LoadAsync(PhysicalPathOf(UploadsLocation.ThumbnailOf(path)));

        Assert.Equal((400, 600), (original.Width, original.Height));
        Assert.Equal((ImageVariants.ThumbnailEdgeInPixels, 432), (thumbnail.Width, thumbnail.Height));
        Assert.Null(original.Metadata.ExifProfile);
        Assert.Null(thumbnail.Metadata.ExifProfile);
    }

    [Fact]
    public async Task UploadImage_OfBytesThatAreNotAnImage_IsRefusedAndWritesNothing()
    {
        StorageService service = ServiceOn(_webRoot);

        InvalidImageException exception = await Assert.ThrowsAsync<InvalidImageException>(
            () => service.UploadImageAsync(FileOfSize("image/png", 12), EnumStorageContainer.LostAndFound));

        Assert.Equal(ImageVariants.CorruptedMessage, exception.Message);
        Assert.Empty(Directory.GetFiles(Path.Combine(_webRoot, "uploads", "lostandfound"), "*", SearchOption.AllDirectories));
    }

    [Fact]
    public void ThumbnailOf_AStoredImage_LivesBesideItUnderTheSameName()
    {
        Assert.Equal(
            "uploads/lostandfound/thumbnails/8a1b0f2e-0000-4000-8000-000000000000.webp",
            UploadsLocation.ThumbnailOf("uploads/lostandfound/8a1b0f2e-0000-4000-8000-000000000000.jpg"));
    }

    [Fact]
    public async Task DeleteImage_RemovesTheOriginalAndItsThumbnail()
    {
        StorageService service = ServiceOn(_webRoot);
        string path = await service.UploadImageAsync(FileOf("image/webp"), EnumStorageContainer.LostAndFound);

        await service.DeleteImageAsync(path);

        Assert.False(File.Exists(PhysicalPathOf(path)));
        Assert.False(File.Exists(PhysicalPathOf(UploadsLocation.ThumbnailOf(path))));
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

        Assert.Empty(Directory.GetFiles(Path.Combine(_webRoot, "uploads", "lostandfound"), "*", SearchOption.AllDirectories));
    }

    [Fact]
    public async Task CreateDenunciation_WhenTheDatabaseRefusesIt_LeavesNoFileBehind()
    {
        StorageService storage = ServiceOn(_webRoot);
        DenunciationService service = new(
            new RefusingDenunciationRepository(), storage, NullLogger<DenunciationService>.Instance);

        CreateDenunciationDto dto = new()
        {
            Category = EnumDenunciationCategory.ImproperCharging,
            Description = "O motorista cobrou valor acima do combinado na carona de ontem.",
            IsAnonymous = false,
            Image = FileOf("image/png"),
        };

        await Assert.ThrowsAsync<DbUpdateException>(() => service.CreateAsync(dto, 1));

        Assert.Empty(Directory.GetFiles(Path.Combine(_webRoot, "uploads", "denunciation"), "*", SearchOption.AllDirectories));
    }
}
