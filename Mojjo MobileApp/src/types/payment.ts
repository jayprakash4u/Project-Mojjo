export type PaymentProvider = 'eSewa' | 'Khalti' | 'COD';

export interface InitiatePaymentRequest {
  orderId: string;
  gateway: 'esewa' | 'khalti' | 'cod';
}

export interface InitiatePaymentResponseDto {
  orderId: string;
  gateway: string;
  amount: number;
  transactionUuid: string;
  pidx?: string;
  paymentUrl?: string;
  formData?: Record<string, string>;
}

export interface VerifyEsewaPaymentRequest {
  data: string; // Base64 encoded payload returned by eSewa
}

export interface VerifyKhaltiPaymentRequest {
  pidx: string;
}

export interface PaymentVerificationResultDto {
  success: boolean;
  orderId: string;
  gateway: string;
  gatewayTransactionId?: string;
  amount: number;
  status: string; // "Completed" | "Pending" | "Failed"
  message: string;
}

export interface PaymentStatusDto {
  orderId: string;
  paymentStatus: string;
  orderStatus: string;
  total: number;
  transactions: {
    id: string;
    gateway: string;
    amount: number;
    status: string;
    transactionUuid: string;
    gatewayTransactionId?: string;
    createdAt: string;
    verifiedAt?: string;
  }[];
}
