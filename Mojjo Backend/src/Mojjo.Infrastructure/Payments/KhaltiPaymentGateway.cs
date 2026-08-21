using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.External;

namespace Mojjo.Infrastructure.Payments;

public class KhaltiPaymentGateway : IKhaltiPaymentGateway
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<KhaltiPaymentGateway> _logger;
    private readonly HttpClient _httpClient;

    public KhaltiPaymentGateway(IConfiguration configuration, ILogger<KhaltiPaymentGateway> logger, HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<KhaltiInitiateResult> InitiatePaymentAsync(string orderId, decimal amount, string purchaseOrderName, CancellationToken cancellationToken = default)
    {
        var secretKey = _configuration["PaymentSettings:Khalti:SecretKey"] ?? "test_secret_key_8b9911e3b5be4910b8cfb46536004d44";
        var baseUrl = _configuration["PaymentSettings:Khalti:BaseUrl"] ?? "https://a.khalti.com/api/v2";
        var returnUrl = _configuration["PaymentSettings:Khalti:ReturnUrl"] ?? "http://localhost:3000/checkout/payment-success";
        var websiteUrl = _configuration["PaymentSettings:Khalti:WebsiteUrl"] ?? "http://localhost:3000";

        var amountInPaisa = (int)(amount * 100);

        var payload = new
        {
            return_url = returnUrl,
            website_url = websiteUrl,
            amount = amountInPaisa,
            purchase_order_id = orderId,
            purchase_order_name = purchaseOrderName
        };

        var requestJson = JsonSerializer.Serialize(payload);
        var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl.TrimEnd('/')}/epayment/initiate/")
        {
            Content = new StringContent(requestJson, Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Key", secretKey);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Khalti initiate failed ({StatusCode}): {Body}", response.StatusCode, responseContent);
            throw new InvalidOperationException($"Failed to initiate payment with Khalti: {responseContent}");
        }

        using var doc = JsonDocument.Parse(responseContent);
        var root = doc.RootElement;

        var pidx = root.GetProperty("pidx").GetString() ?? "";
        var paymentUrl = root.GetProperty("payment_url").GetString() ?? "";
        var expiresIn = root.TryGetProperty("expires_in", out var ei) ? ei.GetInt32() : 1800;

        return new KhaltiInitiateResult
        {
            Pidx = pidx,
            PaymentUrl = paymentUrl,
            ExpiresIn = expiresIn
        };
    }

    public async Task<KhaltiVerificationResult> LookupPaymentAsync(string pidx, CancellationToken cancellationToken = default)
    {
        try
        {
            var secretKey = _configuration["PaymentSettings:Khalti:SecretKey"] ?? "test_secret_key_8b9911e3b5be4910b8cfb46536004d44";
            var baseUrl = _configuration["PaymentSettings:Khalti:BaseUrl"] ?? "https://a.khalti.com/api/v2";

            var payload = new { pidx };
            var requestJson = JsonSerializer.Serialize(payload);

            var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl.TrimEnd('/')}/epayment/lookup/")
            {
                Content = new StringContent(requestJson, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Key", secretKey);

            var response = await _httpClient.SendAsync(request, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            _logger.LogInformation("Khalti lookup response: {Content}", responseContent);

            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;

            var status = root.TryGetProperty("status", out var s) ? s.GetString() ?? "" : "";
            var transactionId = root.TryGetProperty("transaction_id", out var ti) ? ti.GetString() : null;
            var totalAmountInPaisa = root.TryGetProperty("total_amount", out var ta) ? ta.GetDecimal() : 0;

            var isCompleted = status.Equals("Completed", StringComparison.OrdinalIgnoreCase);

            return new KhaltiVerificationResult
            {
                IsValid = isCompleted,
                Status = status,
                Pidx = pidx,
                TransactionId = transactionId,
                TotalAmountInPaisa = totalAmountInPaisa,
                RawResponse = responseContent,
                ErrorMessage = isCompleted ? null : $"Khalti payment status is '{status}'."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to perform Khalti payment lookup.");
            return new KhaltiVerificationResult
            {
                IsValid = false,
                Pidx = pidx,
                RawResponse = ex.Message,
                ErrorMessage = $"Khalti lookup exception: {ex.Message}"
            };
        }
    }
}
