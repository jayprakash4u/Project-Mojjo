import { ApiClient } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import {
  InitiatePaymentRequest,
  InitiatePaymentResponseDto,
  VerifyEsewaPaymentRequest,
  VerifyKhaltiPaymentRequest,
  PaymentVerificationResultDto,
  PaymentStatusDto,
} from '../../types/payment';

export class PaymentsApi {
  /**
   * 1. Initiate secure payment session with .NET Backend.
   * Backend generates HMAC signature and requests gateway session without exposing secrets to mobile.
   */
  static async initiatePayment(
    request: InitiatePaymentRequest,
    signal?: AbortSignal
  ): Promise<InitiatePaymentResponseDto> {
    return await ApiClient.post<InitiatePaymentResponseDto>(
      ENDPOINTS.PAYMENTS.INITIATE,
      request,
      { signal }
    );
  }

  /**
   * 2a. Server-side cryptographic signature and transaction verification for eSewa.
   * The .NET backend independently validates HMAC signature and checks status directly with eSewa.
   */
  static async verifyEsewaPayment(
    request: VerifyEsewaPaymentRequest,
    signal?: AbortSignal
  ): Promise<PaymentVerificationResultDto> {
    return await ApiClient.post<PaymentVerificationResultDto>(
      ENDPOINTS.PAYMENTS.VERIFY_ESEWA,
      request,
      { signal }
    );
  }

  /**
   * 2b. Server-to-server lookup verification for Khalti ePayment v2.
   * The .NET backend queries Khalti status API directly with the server secret key.
   */
  static async verifyKhaltiPayment(
    request: VerifyKhaltiPaymentRequest,
    signal?: AbortSignal
  ): Promise<PaymentVerificationResultDto> {
    return await ApiClient.post<PaymentVerificationResultDto>(
      ENDPOINTS.PAYMENTS.VERIFY_KHALTI,
      request,
      { signal }
    );
  }

  /**
   * 2c. Development & Mock Payment verification.
   * Simulates immediate server-side confirmation for dev testing and simulated checkouts.
   */
  static async verifyMockPayment(
    orderId: string,
    signal?: AbortSignal
  ): Promise<PaymentVerificationResultDto> {
    return await ApiClient.post<PaymentVerificationResultDto>(
      ENDPOINTS.PAYMENTS.VERIFY_MOCK(orderId),
      {},
      { signal }
    );
  }

  /**
   * Retrieve authoritative payment status from backend.
   */
  static async getPaymentStatus(
    orderId: string,
    signal?: AbortSignal
  ): Promise<PaymentStatusDto> {
    return await ApiClient.get<PaymentStatusDto>(
      ENDPOINTS.PAYMENTS.ORDER_STATUS(orderId),
      undefined,
      { signal }
    );
  }
}
