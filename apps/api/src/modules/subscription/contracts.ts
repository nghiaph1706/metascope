export type SubscriptionPlanType = "premium_monthly";

export interface CreatePaymentLinkRequestDto {
  planType: SubscriptionPlanType;
}

export interface CreatePaymentLinkResponseDto {
  checkoutUrl: string;
  orderCode: number;
  amount: number;
  expiresAt: string;
  paymentLinkId?: string;
}

export interface PaymentLinkProviderRequest {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  expiredAtUnix: number;
}

export interface PaymentLinkProviderResponse {
  checkoutUrl: string;
  paymentLinkId?: string;
}

export interface PaymentLinkProvider {
  createPaymentLink(input: PaymentLinkProviderRequest): Promise<PaymentLinkProviderResponse>;
}

export interface PendingPaymentTransaction {
  firebaseUid: string;
  orderCode: number;
  amount: number;
  planType: SubscriptionPlanType;
  status: "pending";
  paymentLinkId?: string;
  expiresAt: string;
}

export interface PaymentTransactionRecord {
  firebaseUid: string;
  orderCode: number;
  amount: number;
  planType: SubscriptionPlanType;
  status: "pending" | "paid";
  paymentLinkId?: string;
  expiresAt: string;
}

export interface PaymentLookupRepository {
  findByOrderCodeForUpdate(
    orderCode: number,
    tx: unknown,
  ): Promise<PaymentTransactionRecord | null>;
  markPaidIfPending(
    orderCode: number,
    tx: unknown,
  ): Promise<"updated" | "already_paid" | "not_found">;
}

export interface PaymentTransactionRepository {
  existsByOrderCode(orderCode: number): Promise<boolean>;
  createPending(tx: PendingPaymentTransaction): Promise<void>;
}

export interface CreatePaymentLinkConfig {
  returnUrl: string;
  cancelUrl: string;
  expirySeconds: number;
}
