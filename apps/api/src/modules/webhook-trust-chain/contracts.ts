export interface WebhookAckResponse {
  /** Application-level ack code, kept stable for integrations. */
  code: "00" | "01" | "02";
  message: string;
  /** Included only for quota/rate semantics, unit is seconds. */
  retry_after?: number;
}

export type WebhookProvider = "payos";

export interface VerifiedWebhookEvent {
  provider: WebhookProvider;
  eventId: string;
  eventType: string;
  transactionId?: string;
  rawBody: string;
  payload: Record<string, unknown>;
}

export interface WebhookSignatureVerifier {
  /** Returns verified event, throws when signature is invalid. */
  verify(rawBody: string, signatureHeader: string | undefined): Promise<VerifiedWebhookEvent>;
}

export interface ProcessedWebhookRepository {
  markProcessedWithinTransaction(
    provider: WebhookProvider,
    eventId: string,
    tx: unknown,
  ): Promise<void>;

  hasBeenProcessed(provider: WebhookProvider, eventId: string): Promise<boolean>;
}

export interface SecurityAuditLogger {
  logTransactionNotFound(event: VerifiedWebhookEvent): Promise<void>;
}
