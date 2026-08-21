using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Infrastructure.Services;

/// <summary>
/// Development Email simulator.
/// Prints formatted email previews directly to the developer console,
/// eliminating SMTP/API keys and costs during local development and testing.
/// </summary>
public class FakeEmailService : IEmailService
{
    private readonly ILogger<FakeEmailService> _logger;

    public FakeEmailService(ILogger<FakeEmailService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC");

        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.WriteLine();
        Console.WriteLine("================================================================================");
        Console.WriteLine("                       [DEV EMAIL SIMULATOR]                                    ");
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine($"  To Recipient : {toEmail}");
        Console.WriteLine($"  Subject      : {subject}");
        Console.WriteLine($"  Body Preview : {htmlBody}");
        Console.WriteLine($"  Dispatched At: {timestamp}");
        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine();

        _logger.LogInformation("DEV Email Simulated to {ToEmail} | Subject: {Subject}", toEmail, subject);
        return Task.FromResult(true);
    }

    public Task<bool> SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, string customerName, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC");

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine();
        Console.WriteLine("================================================================================");
        Console.WriteLine("                [DEV ORDER CONFIRMATION EMAIL SIMULATOR]                        ");
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine($"  Customer     : {customerName} <{toEmail}>");
        Console.WriteLine($"  Order ID     : #{orderId}");
        Console.WriteLine($"  Total Amount : NPR {totalAmount:N2}");
        Console.WriteLine($"  Status       : Payment Confirmed / Order Placed Successfully");
        Console.WriteLine($"  Dispatched At: {timestamp}");
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine();

        _logger.LogInformation("DEV Order Confirmation Email Simulated for Order #{OrderId} to {ToEmail}", orderId, toEmail);
        return Task.FromResult(true);
    }

    public Task<bool> SendWelcomeEmailAsync(string toEmail, string customerName, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC");

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine();
        Console.WriteLine("================================================================================");
        Console.WriteLine("                   [DEV WELCOME EMAIL SIMULATOR]                                ");
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine($"  Customer     : {customerName} <{toEmail}>");
        Console.WriteLine($"  Welcome Bonus: +50 Mojjo Reward Coins Awarded!");
        Console.WriteLine($"  Dispatched At: {timestamp}");
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine();

        _logger.LogInformation("DEV Welcome Email Simulated for {CustomerName} <{ToEmail}>", customerName, toEmail);
        return Task.FromResult(true);
    }
}
