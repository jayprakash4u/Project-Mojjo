using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Mojjo.Application.Common;
using Mojjo.Application.DTOs.Payments;
using Mojjo.Application.Interfaces.Common;
using Mojjo.Application.Interfaces.External;
using Mojjo.Application.Interfaces.Services;
using Mojjo.Domain.Entities;
using Mojjo.Domain.Enums;

namespace Mojjo.Infrastructure.Payments;

public class PaymentService : IPaymentService
{
    private readonly IApplicationDbContext _context;
    private readonly IEsewaPaymentGateway _esewaGateway;
    private readonly IKhaltiPaymentGateway _khaltiGateway;
    private readonly IInventoryService _inventoryService;
    private readonly IEmailService _emailService;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IApplicationDbContext context,
        IEsewaPaymentGateway esewaGateway,
        IKhaltiPaymentGateway khaltiGateway,
        IInventoryService inventoryService,
        IEmailService emailService,
        ILogger<PaymentService> logger)
    {
        _context = context;
        _esewaGateway = esewaGateway;
        _khaltiGateway = khaltiGateway;
        _inventoryService = inventoryService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<ApiResponse<InitiatePaymentResponseDto>> InitiatePaymentAsync(InitiatePaymentRequest request, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);
        if (order == null)
        {
            return ApiResponse<InitiatePaymentResponseDto>.Fail("Order not found.");
        }

        if (order.PaymentStatus == PaymentStatus.Completed)
        {
            return ApiResponse<InitiatePaymentResponseDto>.Fail("Order has already been paid.");
        }

        var gatewayType = request.Gateway.ToLower() switch
        {
            "esewa" => PaymentGateway.Esewa,
            "khalti" => PaymentGateway.Khalti,
            _ => PaymentGateway.Cod
        };

        var transactionUuid = $"MOJJO-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..30];

        var paymentTransaction = new PaymentTransaction
        {
            OrderId = order.Id,
            UserId = order.UserId,
            Gateway = gatewayType,
            Amount = order.Total,
            Currency = "NPR",
            Status = PaymentStatus.Initiated,
            TransactionUuid = transactionUuid
        };

        var responseDto = new InitiatePaymentResponseDto
        {
            OrderId = order.Id,
            Gateway = request.Gateway.ToLower(),
            Amount = order.Total,
            TransactionUuid = transactionUuid
        };

        if (gatewayType == PaymentGateway.Esewa)
        {
            var esewaPayload = _esewaGateway.GenerateInitiatePayload(order.Id, order.Total, transactionUuid);
            responseDto.PaymentUrl = esewaPayload.PaymentUrl;
            responseDto.FormData = esewaPayload.FormData;
        }
        else if (gatewayType == PaymentGateway.Khalti)
        {
            var khaltiResult = await _khaltiGateway.InitiatePaymentAsync(order.Id, order.Total, $"Mojjo Order #{order.Id[..8].ToUpper()}", cancellationToken);
            paymentTransaction.Pidx = khaltiResult.Pidx;
            responseDto.Pidx = khaltiResult.Pidx;
            responseDto.PaymentUrl = khaltiResult.PaymentUrl;
        }

        _context.PaymentTransactions.Add(paymentTransaction);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<InitiatePaymentResponseDto>.Ok(responseDto, "Payment initiated successfully.");
    }

    public async Task<ApiResponse<PaymentVerificationResultDto>> VerifyEsewaPaymentAsync(VerifyEsewaPaymentRequest request, CancellationToken cancellationToken = default)
    {
        // 1. Server-side verification with eSewa (HMAC-SHA256 signature and response parsing)
        var verification = await _esewaGateway.VerifyTransactionAsync(request.Data, cancellationToken);
        if (!verification.IsValid)
        {
            return ApiResponse<PaymentVerificationResultDto>.Fail(verification.ErrorMessage ?? "eSewa payment verification failed.");
        }

        // 2. Lookup transaction by TransactionUuid
        var payment = await _context.PaymentTransactions
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.TransactionUuid == verification.TransactionUuid, cancellationToken);

        if (payment == null)
        {
            return ApiResponse<PaymentVerificationResultDto>.Fail("No matching payment transaction found for this eSewa reference.");
        }

        // 3. Idempotency Check: Prevent duplicate payment processing
        if (payment.Status == PaymentStatus.Completed)
        {
            return ApiResponse<PaymentVerificationResultDto>.Ok(new PaymentVerificationResultDto
            {
                Success = true,
                OrderId = payment.OrderId,
                Gateway = "esewa",
                GatewayTransactionId = payment.GatewayTransactionId,
                Amount = payment.Amount,
                Status = "Completed",
                Message = "Payment was already verified."
            });
        }

        // 4. Amount Verification: Ensure paid amount matches exact order total (prevents amount tampering)
        if (payment.Order != null && Math.Abs(verification.TotalAmount - payment.Order.Total) > 0.01m)
        {
            _logger.LogWarning("eSewa Amount Mismatch! Order total: {OrderTotal}, Paid: {Paid}", payment.Order.Total, verification.TotalAmount);
            payment.Status = PaymentStatus.Failed;
            payment.FailureReason = $"Amount mismatch: expected NPR {payment.Order.Total}, received NPR {verification.TotalAmount}";
            await _context.SaveChangesAsync(cancellationToken);

            return ApiResponse<PaymentVerificationResultDto>.Fail("Payment amount does not match order total.");
        }

        // 5. Complete payment state transition
        payment.Status = PaymentStatus.Completed;
        payment.GatewayTransactionId = verification.RefId;
        payment.VerifiedAt = DateTime.UtcNow;
        payment.GatewayResponseRaw = verification.RawResponse;

        if (payment.Order != null)
        {
            payment.Order.PaymentStatus = PaymentStatus.Completed;
            payment.Order.Status = OrderStatus.Confirmed;
            payment.Order.UpdatedAt = DateTime.UtcNow;

            // Credit reward coins and dispatch confirmation notification if not already done
            if (!string.IsNullOrEmpty(payment.Order.UserId))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == payment.Order.UserId, cancellationToken);
                if (user != null)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = user.Id,
                        Title = "Payment Verified! 💳",
                        Message = $"Payment of NPR {payment.Amount:N0} for order #{payment.Order.Id[..8].ToUpper()} via eSewa has been verified.",
                        Type = "order",
                        Link = $"/order-tracker/{payment.Order.Id}"
                    });
                }
            }

            // Commit reserved inventory stock to permanently sold
            await _inventoryService.CommitOrderStockAsync(payment.OrderId, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<PaymentVerificationResultDto>.Ok(new PaymentVerificationResultDto
        {
            Success = true,
            OrderId = payment.OrderId,
            Gateway = "esewa",
            GatewayTransactionId = verification.RefId,
            Amount = payment.Amount,
            Status = "Completed",
            Message = "eSewa payment successfully verified!"
        });
    }

    public async Task<ApiResponse<PaymentVerificationResultDto>> VerifyKhaltiPaymentAsync(VerifyKhaltiPaymentRequest request, CancellationToken cancellationToken = default)
    {
        // 1. Server-side verification with Khalti API v2 (lookup by PIDX with secret key)
        var lookup = await _khaltiGateway.LookupPaymentAsync(request.Pidx, cancellationToken);
        if (!lookup.IsValid)
        {
            return ApiResponse<PaymentVerificationResultDto>.Fail(lookup.ErrorMessage ?? "Khalti payment verification failed.");
        }

        // 2. Lookup transaction by PIDX
        var payment = await _context.PaymentTransactions
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Pidx == request.Pidx, cancellationToken);

        if (payment == null)
        {
            return ApiResponse<PaymentVerificationResultDto>.Fail("No matching payment transaction found for this Khalti PIDX.");
        }

        // 3. Idempotency Check
        if (payment.Status == PaymentStatus.Completed)
        {
            return ApiResponse<PaymentVerificationResultDto>.Ok(new PaymentVerificationResultDto
            {
                Success = true,
                OrderId = payment.OrderId,
                Gateway = "khalti",
                GatewayTransactionId = payment.GatewayTransactionId,
                Amount = payment.Amount,
                Status = "Completed",
                Message = "Payment was already verified."
            });
        }

        // 4. Amount Verification (Amount in Khalti is in Paisa: NPR 1 = 100 Paisa)
        var expectedAmountInPaisa = payment.Order != null ? payment.Order.Total * 100 : payment.Amount * 100;
        if (Math.Abs(lookup.TotalAmountInPaisa - expectedAmountInPaisa) > 1m)
        {
            _logger.LogWarning("Khalti Amount Mismatch! Expected: {Exp}, Received: {Rec}", expectedAmountInPaisa, lookup.TotalAmountInPaisa);
            payment.Status = PaymentStatus.Failed;
            payment.FailureReason = $"Amount mismatch in paisa: expected {expectedAmountInPaisa}, received {lookup.TotalAmountInPaisa}";
            await _context.SaveChangesAsync(cancellationToken);

            return ApiResponse<PaymentVerificationResultDto>.Fail("Payment amount does not match order total.");
        }

        // 5. Complete payment state transition
        payment.Status = PaymentStatus.Completed;
        payment.GatewayTransactionId = lookup.TransactionId;
        payment.VerifiedAt = DateTime.UtcNow;
        payment.GatewayResponseRaw = lookup.RawResponse;

        if (payment.Order != null)
        {
            payment.Order.PaymentStatus = PaymentStatus.Completed;
            payment.Order.Status = OrderStatus.Confirmed;
            payment.Order.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(payment.Order.UserId))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == payment.Order.UserId, cancellationToken);
                if (user != null)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = user.Id,
                        Title = "Payment Verified! 💳",
                        Message = $"Payment of NPR {payment.Amount:N0} for order #{payment.Order.Id[..8].ToUpper()} via Khalti has been verified.",
                        Type = "order",
                        Link = $"/order-tracker/{payment.Order.Id}"
                    });
                }
            }

            // Commit reserved inventory stock to permanently sold
            await _inventoryService.CommitOrderStockAsync(payment.OrderId, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<PaymentVerificationResultDto>.Ok(new PaymentVerificationResultDto
        {
            Success = true,
            OrderId = payment.OrderId,
            Gateway = "khalti",
            GatewayTransactionId = lookup.TransactionId,
            Amount = payment.Amount,
            Status = "Completed",
            Message = "Khalti payment successfully verified!"
        });
    }

    public async Task<ApiResponse<PaymentVerificationResultDto>> VerifyMockPaymentAsync(string orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Payments)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order == null)
        {
            return ApiResponse<PaymentVerificationResultDto>.Fail("Order not found.");
        }

        if (order.PaymentStatus == PaymentStatus.Completed)
        {
            return ApiResponse<PaymentVerificationResultDto>.Fail("Order payment is already completed.");
        }

        var mockTxnId = $"MOCK-TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";

        var payment = order.Payments.OrderByDescending(p => p.CreatedAt).FirstOrDefault();
        if (payment == null)
        {
            payment = new PaymentTransaction
            {
                OrderId = order.Id,
                UserId = order.UserId,
                Gateway = PaymentGateway.Cod,
                Amount = order.Total,
                Currency = "NPR",
                TransactionUuid = mockTxnId,
                Status = PaymentStatus.Initiated
            };
            _context.PaymentTransactions.Add(payment);
        }

        payment.Status = PaymentStatus.Completed;
        payment.GatewayTransactionId = mockTxnId;
        payment.VerifiedAt = DateTime.UtcNow;

        order.PaymentStatus = PaymentStatus.Completed;
        order.Status = OrderStatus.Confirmed;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Commit inventory stock deduction
        await _inventoryService.CommitOrderStockAsync(order.Id, cancellationToken);

        // Trigger development simulated confirmation email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == order.UserId, cancellationToken);
        var recipientEmail = user?.Email ?? "customer@mojjo.store";
        var recipientName = user?.FullName ?? "Valued Customer";

        await _emailService.SendOrderConfirmationEmailAsync(recipientEmail, order.Id, order.Total, recipientName, cancellationToken);

        // Print high-visibility terminal banner
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine();
        Console.WriteLine("================================================================================");
        Console.WriteLine("                    [DEV MOCK PAYMENT SUCCESS SIMULATOR]                        ");
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine($"  Order ID     : #{order.Id}");
        Console.WriteLine($"  Amount Paid  : NPR {order.Total:N2}");
        Console.WriteLine($"  Mock Txn ID  : {mockTxnId}");
        Console.WriteLine($"  Order Status : Confirmed & Processing");
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("================================================================================");
        Console.ResetColor();
        Console.WriteLine();

        _logger.LogInformation("DEV Mock Payment verified for Order #{OrderId} [Txn: {TxnId}]", order.Id, mockTxnId);

        return ApiResponse<PaymentVerificationResultDto>.Ok(new PaymentVerificationResultDto
        {
            Success = true,
            OrderId = order.Id,
            Gateway = "mock",
            GatewayTransactionId = mockTxnId,
            Amount = order.Total,
            Status = "Completed",
            Message = "Mock payment verified successfully! Order is now processing."
        });
    }

    public async Task<ApiResponse<PaymentStatusDto>> GetPaymentStatusByOrderIdAsync(string orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Payments)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order == null)
        {
            return ApiResponse<PaymentStatusDto>.Fail("Order not found.");
        }

        var dto = new PaymentStatusDto
        {
            OrderId = order.Id,
            PaymentStatus = order.PaymentStatus.ToString(),
            OrderStatus = order.Status.ToString(),
            Total = order.Total,
            Transactions = order.Payments.OrderByDescending(p => p.CreatedAt).Select(p => new PaymentTransactionSummaryDto
            {
                Id = p.Id,
                Gateway = p.Gateway.ToString(),
                Amount = p.Amount,
                Status = p.Status.ToString(),
                TransactionUuid = p.TransactionUuid,
                GatewayTransactionId = p.GatewayTransactionId,
                CreatedAt = p.CreatedAt,
                VerifiedAt = p.VerifiedAt
            }).ToList()
        };

        return ApiResponse<PaymentStatusDto>.Ok(dto);
    }
}
