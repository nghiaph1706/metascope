import type { PoolClient } from "pg";
import type { Pool } from "pg";
import type { ProcessedWebhookRepository, WebhookProvider } from "./contracts";

export class PostgresProcessedWebhookRepository implements ProcessedWebhookRepository {
  public constructor(private readonly pool: Pool) {}

  public async hasBeenProcessed(provider: WebhookProvider, eventId: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT 1 FROM payment_webhook_processed WHERE provider = $1 AND event_id = $2 LIMIT 1`,
      [provider, eventId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  public async markProcessedWithinTransaction(
    provider: WebhookProvider,
    eventId: string,
    tx: unknown,
  ): Promise<void> {
    const client = tx as PoolClient;
    await client.query(
      `INSERT INTO payment_webhook_processed(provider, event_id) VALUES ($1, $2) ON CONFLICT (provider, event_id) DO NOTHING`,
      [provider, eventId],
    );
  }
}
