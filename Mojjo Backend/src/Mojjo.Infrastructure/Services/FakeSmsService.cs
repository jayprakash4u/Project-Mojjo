using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Infrastructure.Services;

/// <summary>
/// Development SMS simulator.
/// Prints one-time passwords and transactional SMS directly to the developer console,
/// eliminating third-party SMS costs during local development, staging, and automated testing.
/// </summary>
public class FakeSmsService : ISmsService
{
    private readonly ILogger<FakeSmsService> _logger;

    public FakeSmsService(ILogger<FakeSmsService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendOtpSmsAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC");

        // Print a high-visibility terminal banner for instant developer developer experience
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine();
        Console.WriteLine("================================================================================");
        Console.WriteLine("                        [DEV OTP SMS SIMULATOR]                                ");
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.Write("  Target Phone : ");
        Console.ForegroundColor = ConsoleColor.White;
        Console.WriteLine(phoneNumber);
        Console.ResetColor();

        Console.Write("  DEV OTP CODE : ");
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"\x1b[1m{otpCode}\x1b[0m");
        Console.ResetColor();

        Console.Write("  SMS Payload  : ");
        Console.WriteLine($"Your Mojjo verification code is {otpCode}. Valid for 5 minutes. Do not share.");
        Console.Write("  Dispatched At: ");
        Console.WriteLine(timestamp);
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine();

        _logger.LogInformation("DEV OTP Generated for {PhoneNumber}: [OTP: {OtpCode}]", phoneNumber, otpCode);

        return Task.FromResult(true);
    }

    public Task<bool> SendTransactionalSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC");

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine();
        Console.WriteLine("================================================================================");
        Console.WriteLine("                    [DEV TRANSACTIONAL SMS SIMULATOR]                           ");
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine($"  Target Phone : {phoneNumber}");
        Console.WriteLine($"  SMS Body     : {message}");
        Console.WriteLine($"  Dispatched At: {timestamp}");
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine();

        _logger.LogInformation("DEV Transactional SMS for {PhoneNumber}: {Message}", phoneNumber, message);

        return Task.FromResult(true);
    }
}
