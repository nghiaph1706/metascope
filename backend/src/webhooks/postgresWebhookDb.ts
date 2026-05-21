import { DatabaseError, Pool, PoolClient } from "pg";
import { WebhookDb, WebhookDbTx } from "./types";

export class DuplicateWebhookError extends Error {
  constructor() {
    super("duplicate_webhook_event");
  }
}

class PostgresWebhookDbTx implements WebhookDbTx {
  constructor(private readonly client: PoolClient) {}

  async markProcessed(provider: string, eventId: string): Promise<void> {
    try {
      await this.client.query(
        `insert into processed_webhooks(provider, event_id) values ($1, $2)`,
        [provider, eventId],
      );
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new DuplicateWebhookError();
      }
      throw error;
    }
  }

  async updatePaymentCompleted(orderCode: number, paidAt?: string): Promise<boolean> {
    const result = await this.client.query(
      `
        update payment_transactions
        set status = 'completed', paid_at = coalesce($2::timestamptz, now())
        where order_code = $1 and status = 'pending'
      `,
      [orderCode, paidAt ?? null],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async getUserById(userId: string) {
    const result = await this.client.query(
      `select id, tier, tier_expires_at from users where id = $1`,
      [userId],
    );

    if (!result.rowCount) return null;

    const row = result.rows[0] as {
      id: string;
      tier: "basic" | "premium";
      tier_expires_at: string | null;
    };
    return {
      id: row.id,
      tier: row.tier,
      tier_expires_at: row.tier_expires_at,
    };
  }

  async updateUserPremium(userId: string, expiresAtIso: string): Promise<void> {
    await this.client.query(
      `update users set tier = 'premium', tier_expires_at = $2::timestamptz where id = $1`,
      [userId, expiresAtIso],
    );
  }

  async insertEntitlementLedger(input: {
    user_id: string;
    source: "payos_webhook";
    action: "grant" | "extend";
    tier_before: "basic" | "premium";
    tier_after: "premium";
    expires_before?: string | null;
    expires_after: string;
    reference_id: string;
  }): Promise<void> {
    await this.client.query(
      `
        insert into entitlement_ledger(
          user_id, source, action, tier_before, tier_after, expires_before, expires_after, reference_id
        ) values ($1,$2,$3,$4,$5,$6::timestamptz,$7::timestamptz,$8)
      `,
      [
        input.user_id,
        input.source,
        input.action,
        input.tier_before,
        input.tier_after,
        input.expires_before ?? null,
        input.expires_after,
        input.reference_id,
      ],
    );
  }
}

export class PostgresWebhookDb implements WebhookDb {
  constructor(private readonly pool: Pool) {}

  async findTransactionByOrderCode(orderCode: number) {
    const result = await this.pool.query(
      `select id, user_id, order_code, status, paid_at from payment_transactions where order_code = $1`,
      [orderCode],
    );

    if (!result.rowCount) return null;

    const row = result.rows[0] as {
      id: string;
      user_id: string;
      order_code: number;
      status: "pending" | "completed" | "cancelled" | "expired";
      paid_at: string | null;
    };

    return {
      id: row.id,
      user_id: row.user_id,
      order_code: row.order_code,
      status: row.status,
      paid_at: row.paid_at,
    };
  }

  async hasProcessedWebhook(provider: string, eventId: string): Promise<boolean> {
    const result = await this.pool.query(
      `select 1 from processed_webhooks where provider = $1 and event_id = $2 limit 1`,
      [provider, eventId],
    );

    return !!result.rowCount;
  }

  async inTransaction<T>(fn: (tx: WebhookDbTx) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const tx = new PostgresWebhookDbTx(client);
      const result = await fn(tx);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async insertWebhookAudit(input: {
    provider: "payos";
    event_id: string;
    order_code: number;
    reason: "tx_not_found";
    payload: unknown;
  }): Promise<void> {
    await this.pool.query(
      `insert into webhook_audit(provider, event_id, order_code, reason, payload) values ($1,$2,$3,$4,$5::jsonb)`,
      [
        input.provider,
        input.event_id,
        input.order_code,
        input.reason,
        JSON.stringify(input.payload),
      ],
    );
  }
}
