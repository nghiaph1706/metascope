export type AckCode = "00" | "01" | "02";

export interface PayOSWebhookData {
  orderCode: number;
  amount: number;
  description?: string;
  accountNumber?: string;
  reference?: string;
  transactionDateTime?: string;
  currency?: string;
  paymentLinkId?: string;
  code?: string;
  desc?: string;
}

export interface PayOSWebhookPayload {
  code: string;
  desc?: string;
  success: boolean;
  data: PayOSWebhookData;
  signature?: string;
  event_id: string;
}

export interface AckResponse {
  code: AckCode;
  desc: string;
  retry_after?: number;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  order_code: number;
  status: "pending" | "completed" | "cancelled" | "expired";
  paid_at?: string | null;
}

export interface UserRecord {
  id: string;
  tier: "basic" | "premium";
  tier_expires_at?: string | null;
}

export interface WebhookDbTx {
  markProcessed(provider: string, eventId: string): Promise<void>;
  updatePaymentCompleted(orderCode: number, paidAt?: string): Promise<boolean>;
  getUserById(userId: string): Promise<UserRecord | null>;
  updateUserPremium(userId: string, expiresAtIso: string): Promise<void>;
  insertEntitlementLedger(input: {
    user_id: string;
    source: "payos_webhook";
    action: "grant" | "extend";
    tier_before: "basic" | "premium";
    tier_after: "premium";
    expires_before?: string | null;
    expires_after: string;
    reference_id: string;
  }): Promise<void>;
}

export interface WebhookDb {
  findTransactionByOrderCode(orderCode: number): Promise<PaymentTransaction | null>;
  hasProcessedWebhook(provider: string, eventId: string): Promise<boolean>;
  inTransaction<T>(fn: (tx: WebhookDbTx) => Promise<T>): Promise<T>;
  insertWebhookAudit(input: {
    provider: "payos";
    event_id: string;
    order_code: number;
    reason: "tx_not_found";
    payload: unknown;
  }): Promise<void>;
}
