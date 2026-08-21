using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Interfaces.External;

namespace Mojjo.Infrastructure.Payments;

public class EsewaPaymentGateway : IEsewaPaymentGateway
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EsewaPaymentGateway> _logger;
    private readonly HttpClient _httpClient;

    public EsewaPaymentGateway(IConfiguration configuration, ILogger<EsewaPaymentGateway> logger, HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
    }

    public EsewaInitiateResult GenerateInitiatePayload(string orderId, decimal amount, string transactionUuid)
    {
        var productCode = _configuration["PaymentSettings:Esewa:ProductCode"] ?? "EPAYTEST";
        var secretKey = _configuration["PaymentSettings:Esewa:SecretKey"] ?? "8gBm/:&EnhH.1/q";
        var baseUrl = _configuration["PaymentSettings:Esewa:BaseUrl"] ?? "https://rc-epay.esewa.com.np";
        var successUrl = _configuration["PaymentSettings:Esewa:SuccessUrl"] ?? "http://localhost:3000/checkout/payment-success";
        var failureUrl = _configuration["PaymentSettings:Esewa:FailureUrl"] ?? "http://localhost:3000/checkout/payment-failed";

        // eSewa signature message format: "total_amount={amount},transaction_uuid={uuid},product_code={code}"
        var totalAmountStr = amount.ToString("0.##");
        var message = $"total_amount={totalAmountStr},transaction_uuid={transactionUuid},product_code={productCode}";
        var signature = GenerateHmacSha256Signature(message, secretKey);

        var formData = new Dictionary<string, string>
        {
            ["amount"] = totalAmountStr,
            ["tax_amount"] = "0",
            ["total_amount"] = totalAmountStr,
            ["transaction_uuid"] = transactionUuid,
            ["product_code"] = productCode,
            ["product_service_charge"] = "0",
            ["product_delivery_charge"] = "0",
            ["success_url"] = successUrl,
            ["failure_url"] = failureUrl,
            ["signed_field_names"] = "total_amount,transaction_uuid,product_code",
            ["signature"] = signature
        };

        return new EsewaInitiateResult
        {
            TransactionUuid = transactionUuid,
            PaymentUrl = $"{baseUrl.TrimEnd('/')}/api/epay/main/v2/form",
            FormData = formData
        };
    }

    public async Task<EsewaVerificationResult> VerifyTransactionAsync(string encodedData, CancellationToken cancellationToken = default)
    {
        try
        {
            var secretKey = _configuration["PaymentSettings:Esewa:SecretKey"] ?? "8gBm/:&EnhH.1/q";
            var productCode = _configuration["PaymentSettings:Esewa:ProductCode"] ?? "EPAYTEST";
            var baseUrl = _configuration["PaymentSettings:Esewa:BaseUrl"] ?? "https://rc-epay.esewa.com.np";

            // 1. Decode Base64 payload received from eSewa redirect
            var jsonBytes = Convert.FromBase64String(encodedData);
            var jsonString = Encoding.UTF8.GetString(jsonBytes);
            _logger.LogInformation("eSewa callback decoded payload: {Payload}", jsonString);

            using var doc = JsonDocument.Parse(jsonString);
            var root = doc.RootElement;

            var status = root.TryGetProperty("status", out var s) ? s.GetString() ?? "" : "";
            var signature = root.TryGetProperty("signature", out var sig) ? sig.GetString() ?? "" : "";
            var transactionUuid = root.TryGetProperty("transaction_uuid", out var tu) ? tu.GetString() ?? "" : "";
            var refId = root.TryGetProperty("transaction_code", out var tc) ? tc.GetString() : null;
            var totalAmountStr = root.TryGetProperty("total_amount", out var ta) ? ta.GetString() ?? "0" : "0";
            var signedFieldNames = root.TryGetProperty("signed_field_names", out var sfn) ? sfn.GetString() ?? "" : "";

            if (!decimal.TryParse(totalAmountStr, out var totalAmount))
            {
                totalAmount = 0;
            }

            // 2. Validate cryptographic signature returned by eSewa
            var messageParts = new List<string>();
            foreach (var field in signedFieldNames.Split(','))
            {
                var trimmed = field.Trim();
                if (root.TryGetProperty(trimmed, out var val))
                {
                    messageParts.Add($"{trimmed}={val.GetString()}");
                }
            }
            var verificationMessage = string.Join(",", messageParts);
            var expectedSignature = GenerateHmacSha256Signature(verificationMessage, secretKey);

            if (!string.Equals(signature, expectedSignature, StringComparison.Ordinal))
            {
                _logger.LogWarning("eSewa signature mismatch! Expected: {Exp}, Received: {Rec}", expectedSignature, signature);
                return new EsewaVerificationResult
                {
                    IsValid = false,
                    Status = status,
                    TransactionUuid = transactionUuid,
                    RawResponse = jsonString,
                    ErrorMessage = "Security signature verification failed. Possible payload tampering."
                };
            }

            var isComplete = status.Equals("COMPLETE", StringComparison.OrdinalIgnoreCase);

            return new EsewaVerificationResult
            {
                IsValid = isComplete,
                Status = status,
                TransactionUuid = transactionUuid,
                RefId = refId,
                TotalAmount = totalAmount,
                RawResponse = jsonString,
                ErrorMessage = isComplete ? null : $"eSewa transaction not completed. Status was '{status}'."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify eSewa payment.");
            return new EsewaVerificationResult
            {
                IsValid = false,
                RawResponse = ex.Message,
                ErrorMessage = $"eSewa verification exception: {ex.Message}"
            };
        }
    }

    private static string GenerateHmacSha256Signature(string message, string secretKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var messageBytes = Encoding.UTF8.GetBytes(message);

        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(messageBytes);
        return Convert.ToBase64String(hashBytes);
    }
}
