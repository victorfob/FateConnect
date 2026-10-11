namespace FateConnect.Api.Modules.Common.Exceptions;

public abstract class InvalidImageException(string message) : Exception(message);

public class UnsupportedImageFormatException()
    : InvalidImageException("Formato de imagem não suportado. Apenas JPG, PNG ou WEBP são permitidos.");

public class CorruptedImageException()
    : InvalidImageException("A imagem enviada está vazia ou corrompida.");
