using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Payments;
using Mojjo.Application.Interfaces.Identity;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Constants;

namespace Mojjo.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[EnableRateLimiting("payment-policy")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ICurrentUserService _currentUserService;

    public PaymentsController(IPaymentService paymentService, ICurrentUserService currentUserService)
    {
        _paymentService = paymentService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Initiate a secure digital payment session with eSewa or Khalti (Authorized).
    /// </summary>
    [Authorize]
    [Filters.Idempotent]
    [HttpPost("initiate")]
    public async Task<ActionResult<ApiResponse<InitiatePaymentResponseDto>>> InitiatePayment(
        [FromBody] InitiatePaymentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _paymentService.InitiatePaymentAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Server-side cryptographic signature and transaction verification for eSewa.
    /// Backend verifies status with eSewa independently rather than trusting client state.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("verify/esewa")]
    public async Task<ActionResult<ApiResponse<PaymentVerificationResultDto>>> VerifyEsewa(
        [FromBody] VerifyEsewaPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _paymentService.VerifyEsewaPaymentAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Server-to-server lookup verification for Khalti ePayment v2.
    /// Backend calls Khalti API directly with secret key to verify status and amount.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("verify/khalti")]
    public async Task<ActionResult<ApiResponse<PaymentVerificationResultDto>>> VerifyKhalti(
        [FromBody] VerifyKhaltiPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _paymentService.VerifyKhaltiPaymentAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Development & Test Mock Payment verification.
    /// Simulates instant successful digital checkout without third-party gateway redirects.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("verify-mock/{orderId}")]
    public async Task<ActionResult<ApiResponse<PaymentVerificationResultDto>>> VerifyMock(
        string orderId,
        CancellationToken cancellationToken)
    {
        var result = await _paymentService.VerifyMockPaymentAsync(orderId, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Retrieve payment status and transaction history for an order.
    /// </summary>
    [Authorize]
    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<ApiResponse<PaymentStatusDto>>> GetPaymentStatus(
        string orderId,
        CancellationToken cancellationToken)
    {
        var result = await _paymentService.GetPaymentStatusByOrderIdAsync(orderId, cancellationToken);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}
