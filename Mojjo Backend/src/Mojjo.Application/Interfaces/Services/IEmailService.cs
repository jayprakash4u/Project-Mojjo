namespace Mojjo.Application.Interfaces.Services;

/// <summary>
/// Senior Developer Interface for Email communications.
/// Decouples email sending from specific providers (SMTP, SendGrid, AWS SES, Mailgun).
/// In Development: Handled by FakeEmailService (prints formatted email previews directly to console).
/// In Production: Handled by RealEmailService (dispatches real HTML emails via SMTP/SendGrid).
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Dispatches a generic HTML email message to the specified recipient.
    /// </summary>
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);

    /// <summary>
    /// Dispatches a formatted Order Confirmation email with summary and item details.
    /// </summary>
    Task<bool> SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, string customerName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Dispatches a Welcome & Onboarding email to newly registered customers.
    /// </summary>
    Task<bool> SendWelcomeEmailAsync(string toEmail, string customerName, CancellationToken cancellationToken = default);
}
