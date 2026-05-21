import type { Pool } from "pg";
import type { SecurityAuditLogger, VerifiedWebhookEvent } from "./contracts";

export class PostgresSecurityAuditLogger implements SecurityAuditLogger {
  public constructor(private readonly pool: Pool) {}

  public async logTransactionNotFound(event: VerifiedWebhookEvent): Promise<void> {
    await this.pool.query(
      `INSERT INTO payment_webhook_audit_log(provider, event_id, event_type, transaction_id, reason) VALUES ($1, $2, $3, $4, $5)`,
      [
        event.provider,
        event.eventId,
        event.eventType,
        event.transactionId ?? null,
        "transaction_not_found",
      ],
    );
  }
}
