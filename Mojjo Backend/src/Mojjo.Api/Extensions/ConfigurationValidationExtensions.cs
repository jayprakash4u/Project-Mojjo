using Serilog;

namespace Mojjo.Api.Extensions;

public static class ConfigurationValidationExtensions
{
    public static void ValidateProductionSecrets(this WebApplication app)
    {
        var config = app.Configuration;
        var env = app.Environment;

        var jwtSecret = config["JwtSettings:Secret"];
        var dbConnection = config.GetConnectionString("DefaultConnection");

        // 1. Mandatory Database Connection Validation
        if (string.IsNullOrWhiteSpace(dbConnection))
        {
            Log.Fatal("FATAL CONFIGURATION ERROR: 'ConnectionStrings:DefaultConnection' is missing or empty.");
            throw new InvalidOperationException("Missing mandatory database connection string.");
        }

        // 2. JWT Secret Length & Entropy Validation
        if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
        {
            var msg = "FATAL SECURITY ERROR: 'JwtSettings:Secret' must be configured with a cryptographically secure key of at least 32 characters (256-bit).";
            Log.Fatal(msg);
            throw new InvalidOperationException(msg);
        }

        // 3. Production Hardening: Block default template placeholders
        if (!env.IsDevelopment())
        {
            var placeholderKeywords = new[]
            {
                "REPLACE_WITH",
                "YourSuperSecret",
                "YourStrongProductionPassword",
                "test_secret_key"
            };

            foreach (var keyword in placeholderKeywords)
            {
                if (jwtSecret.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                {
                    var errorMsg = $"PRODUCTION SECURITY BLOCKED: 'JwtSettings:Secret' contains insecure default placeholder keyword '{keyword}'. Provide a real production secret via environment variable or secret manager.";
                    Log.Fatal(errorMsg);
                    throw new InvalidOperationException(errorMsg);
                }
            }

            Log.Information("Production secrets and cryptographic keys validated successfully.");
        }
        else
        {
            Log.Information("Development configuration and credentials loaded successfully.");
        }
    }
}
