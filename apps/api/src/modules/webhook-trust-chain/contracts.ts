export interface WebhookAckResponse {
  /** Application-level ack code, kept stable for integrations. */
  code: "00" | "01" | "02";
  message: string;
  /** Included only for quota/rate semantics, unit is seconds. */
  retry_after?: number;
}

export interface VerifiedWebhookEvent {
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
  /**
   * Marks webhook processed in the same DB transaction as entitlement mutation.
   */
  markProcessedWithinTransaction(eventId: string, tx: unknown): Promise<void>;

  hasBeenProcessed(eventId: string): Promise<boolean>;
}

export interface SecurityAuditLogger {
  /**
   * Must be emitted when transaction lookup fails (tx-not-found) to support audit trail.
   */
  logTransactionNotFound(event: VerifiedWebhookEvent): Promise<void>;
}
