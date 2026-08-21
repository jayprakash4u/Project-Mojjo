using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Infrastructure.Services;

/// <summary>
/// Production Email dispatcher via SMTP / SendGrid / AWS SES.
/// </summary>
public class RealEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RealEmailService> _logger;

    public RealEmailService(IConfiguration configuration, ILogger<RealEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var smtpHost = _configuration["EmailSettings:SmtpHost"];
        var smtpPort = _configuration.GetValue<int>("EmailSettings:SmtpPort", 587);
        var smtpUser = _configuration["EmailSettings:SmtpUser"];
        var smtpPass = _configuration["EmailSettings:SmtpPassword"];
        var fromEmail = _configuration["EmailSettings:FromEmail"] ?? "noreply@mojjo.store";
        var fromName = _configuration["EmailSettings:FromName"] ?? "Mojjo Store";

        if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpUser))
        {
            _logger.LogWarning("Real email requested but EmailSettings:SmtpHost or SmtpUser is not configured. Email suppressed for {ToEmail}.", toEmail);
            return false;
        }

        try
        {
            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage, cancellationToken);
            _logger.LogInformation("Dispatched real email to {ToEmail} with subject '{Subject}'.", toEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send real email to {ToEmail}.", toEmail);
            return false;
        }
    }

    public async Task<bool> SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, string customerName, CancellationToken cancellationToken = default)
    {
        var subject = $"Mojjo Order Confirmation - #{orderId}";
        var htmlBody = $@"
            <h2>Thank you for your order, {customerName}!</h2>
            <p>Your order <strong>#{orderId}</strong> for <strong>NPR {totalAmount:N2}</strong> has been received and is being processed.</p>
            <p>You can track your live order status directly from the Mojjo mobile app or website.</p>
            <br/>
            <p>Warm regards,<br/>The Mojjo Team</p>";

        return await SendEmailAsync(toEmail, subject, htmlBody, cancellationToken);
    }

    public async Task<bool> SendWelcomeEmailAsync(string toEmail, string customerName, CancellationToken cancellationToken = default)
    {
        var subject = "Welcome to Mojjo! 50 Bonus Coins Added to Your Wallet 🎉";
        var htmlBody = $@"
            <h2>Welcome to the Mojjo Family, {customerName}!</h2>
            <p>We are delighted to have you. As a welcome gift, <strong>50 Mojjo Reward Coins</strong> have been credited to your account.</p>
            <p>Use your reward coins on your first order for instant discounts!</p>
            <br/>
            <p>Happy Shopping,<br/>The Mojjo Team</p>";

        return await SendEmailAsync(toEmail, subject, htmlBody, cancellationToken);
    }
}
