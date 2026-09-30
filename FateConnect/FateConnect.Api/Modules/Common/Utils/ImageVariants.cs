namespace FateConnect.Api.Modules.Common.Utils;

using FateConnect.Api.Modules.Common.Exceptions;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Metadata;
using SixLabors.ImageSharp.Processing;

public static class ImageVariants
{
    public const int ThumbnailEdgeInPixels = 288;
    public const string CorruptedMessage = "A imagem enviada está vazia ou corrompida.";

    private const int OriginalQuality = 90;
    private const int ThumbnailQuality = 80;

    private static readonly SemaphoreSlim OneImageAtATime = new(1, 1);

    public static async Task WriteAsync(Stream upload, string contentType, string originalPath, string thumbnailPath)
    {
        IImageEncoder originalEncoder = EncoderFor(contentType);

        await OneImageAtATime.WaitAsync();

        try
        {
            await WriteVariantsAsync(upload, originalEncoder, originalPath, thumbnailPath);
        }
        finally
        {
            OneImageAtATime.Release();
        }
    }

    private static async Task WriteVariantsAsync(
        Stream upload, IImageEncoder originalEncoder, string originalPath, string thumbnailPath)
    {
        using Image image = await LoadAsync(upload);

        image.Mutate(context => context.AutoOrient());
        DropMetadata(image);

        await image.SaveAsync(originalPath, originalEncoder);

        try
        {
            image.Mutate(context => context.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Min,
                Size = new Size(ThumbnailEdgeInPixels, ThumbnailEdgeInPixels),
            }));

            await image.SaveAsync(thumbnailPath, new WebpEncoder { Quality = ThumbnailQuality });
        }
        catch
        {
            File.Delete(originalPath);
            throw;
        }
    }

    private static async Task<Image> LoadAsync(Stream upload)
    {
        try
        {
            return await Image.LoadAsync(upload);
        }
        catch (Exception exception) when (exception is UnknownImageFormatException or InvalidImageContentException)
        {
            throw new InvalidImageException(CorruptedMessage);
        }
    }

    private static void DropMetadata(Image image)
    {
        image.Metadata.ExifProfile = null;
        image.Metadata.XmpProfile = null;
        image.Metadata.IptcProfile = null;

        foreach (ImageFrameMetadata frameMetadata in image.Frames.Select(frame => frame.Metadata))
        {
            frameMetadata.ExifProfile = null;
            frameMetadata.XmpProfile = null;
            frameMetadata.IptcProfile = null;
        }

        image.Metadata.GetPngMetadata().TextData.Clear();
    }

    private static IImageEncoder EncoderFor(string contentType)
    {
        string extension = ImageContentTypes.ExtensionFor(contentType);

        return extension switch
        {
            ".png" => new PngEncoder(),
            ".webp" => new WebpEncoder { Quality = OriginalQuality },
            _ => new JpegEncoder { Quality = OriginalQuality },
        };
    }
}
