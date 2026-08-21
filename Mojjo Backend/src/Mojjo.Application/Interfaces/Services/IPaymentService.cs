using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Payments;

namespace Mojjo.Application.Interfaces.Services;

public interface IPaymentService
{
    Task<ApiResponse<InitiatePaymentResponseDto>> InitiatePaymentAsync(InitiatePaymentRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<PaymentVerificationResultDto>> VerifyEsewaPaymentAsync(VerifyEsewaPaymentRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<PaymentVerificationResultDto>> VerifyKhaltiPaymentAsync(VerifyKhaltiPaymentRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<PaymentVerificationResultDto>> VerifyMockPaymentAsync(string orderId, CancellationToken cancellationToken = default);
    Task<ApiResponse<PaymentStatusDto>> GetPaymentStatusByOrderIdAsync(string orderId, CancellationToken cancellationToken = default);
}
