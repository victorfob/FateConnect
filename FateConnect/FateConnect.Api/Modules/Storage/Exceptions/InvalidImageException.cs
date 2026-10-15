namespace FateConnect.Api.Modules.Storage.Exceptions;

public abstract class InvalidImageException(string message) : Exception(message);

public class UnsupportedImageFormatException()
    : InvalidImageException("Unsupported image format. Only JPG, PNG or WEBP are allowed.");

public class CorruptedImageException()
    : InvalidImageException("The image sent is empty or corrupted.");
