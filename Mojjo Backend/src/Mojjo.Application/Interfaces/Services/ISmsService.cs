namespace Mojjo.Application.Interfaces.Services;

/// <summary>
/// Senior Developer Interface for SMS & OTP communications.
/// Decouples authentication logic from specific SMS providers (Sparrow SMS, Twilio, AWS SNS, Infobip).
/// In Development: Handled by FakeSmsService (prints DEV OTP directly to console).
/// In Production: Handled by RealSmsService (dispatches via configured cloud SMS gateway).
/// </summary>
public interface ISmsService
{
    /// <summary>
    /// Dispatches a 6-digit one-time password (OTP) verification SMS to the specified phone number.
    /// </summary>
    /// <param name="phoneNumber">Recipient's mobile number.</param>
    /// <param name="otpCode">Generated 6-digit numeric OTP code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if dispatched/simulated successfully.</returns>
    Task<bool> SendOtpSmsAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Dispatches transactional SMS messages (e.g. Order Placed, Out for Delivery, Delivery Completed).
    /// </summary>
    /// <param name="phoneNumber">Recipient's mobile number.</param>
    /// <param name="message">SMS message text content.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if dispatched/simulated successfully.</returns>
    Task<bool> SendTransactionalSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
}
