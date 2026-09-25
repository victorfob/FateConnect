using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.PixelFormats;

namespace FateConnect.Api.Tests;

public static class TestImages
{
    public const ushort RotatedClockwise = 6;

    public static byte[] Png(int width = 40, int height = 30, byte shade = 0x80)
    {
        using Image<Rgba32> image = new(width, height, new Rgba32(shade, shade, shade));
        using MemoryStream content = new();

        image.SaveAsPng(content);

        return content.ToArray();
    }

    public static byte[] JpegTakenWithAPhone(int width, int height, ushort orientation)
    {
        using Image<Rgba32> image = new(width, height, new Rgba32(0x20, 0x60, 0xA0));
        ExifProfile exif = new();
        exif.SetValue(ExifTag.Orientation, orientation);
        exif.SetValue(ExifTag.GPSLatitudeRef, "S");
        exif.SetValue(ExifTag.Model, "Celular de teste");
        image.Metadata.ExifProfile = exif;

        using MemoryStream content = new();

        image.SaveAsJpeg(content);

        return content.ToArray();
    }

    public static Image Decode(byte[] content) => Image.Load(content);
}
