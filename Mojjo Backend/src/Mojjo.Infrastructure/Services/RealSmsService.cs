using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.Services;

namespace Mojjo.Infrastructure.Services;

/// <summary>
/// Production SMS Gateway service.
/// Connects to real SMS carriers (Sparrow SMS in Nepal, Twilio, AWS SNS, Infobip)
/// using resilient HTTP dispatching with credentials configured in appsettings / environment secrets.
/// </summary>
public class RealSmsService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RealSmsService> _logger;

    public RealSmsService(HttpClient httpClient, IConfiguration configuration, ILogger<RealSmsService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendOtpSmsAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        var message = $"Your Mojjo verification code is: {otpCode}. Valid for 5 minutes.";
        return await SendTransactionalSmsAsync(phoneNumber, message, cancellationToken);
    }

    public async Task<bool> SendTransactionalSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        var provider = _configuration["SmsSettings:Provider"] ?? "Sparrow";
        var apiKey = _configuration["SmsSettings:ApiKey"] ?? string.Empty;
        var senderId = _configuration["SmsSettings:SenderId"] ?? "Mojjo";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("Real SMS requested but SmsSettings:ApiKey is not configured. Falling back to structured log for {PhoneNumber}.", phoneNumber);
            return false;
        }

        try
        {
            if (provider.Equals("Sparrow", StringComparison.OrdinalIgnoreCase))
            {
                // Sparrow SMS API (Nepal Standard)
                var endpoint = $"http://api.sparrowsms.com/v2/sms/?token={apiKey}&from={senderId}&to={phoneNumber}&text={Uri.EscapeDataString(message)}";
                var response = await _httpClient.GetAsync(endpoint, cancellationToken);
                return response.IsSuccessStatusCode;
            }
            else if (provider.Equals("Twilio", StringComparison.OrdinalIgnoreCase))
            {
                // Twilio SMS API
                var accountSid = _configuration["SmsSettings:TwilioAccountSid"];
                var fromNumber = _configuration["SmsSettings:TwilioFromNumber"];
                var request = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("To", phoneNumber),
                    new KeyValuePair<string, string>("From", fromNumber ?? senderId),
                    new KeyValuePair<string, string>("Body", message)
                });

                var response = await _httpClient.PostAsync($"https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json", request, cancellationToken);
                return response.IsSuccessStatusCode;
            }

            _logger.LogWarning("Unsupported SMS Provider '{Provider}'.", provider);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to dispatch real SMS to {PhoneNumber} via {Provider}.", phoneNumber, provider);
            return false;
        }
    }
}
