namespace FateConnect.Api.Modules.Auth.Utils;

using System;
using System.Security.Cryptography;
using System.Text;

public static class TokenHelper
{
    public static string GenerateRawToken() =>
        RandomNumberGenerator.GetHexString(64);

    public static string HashToken(string rawToken)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(rawToken);
        byte[] hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
