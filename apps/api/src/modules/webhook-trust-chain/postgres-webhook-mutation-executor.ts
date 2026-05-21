import type { Pool, PoolClient } from "pg";
import type { PaymentLookupRepository } from "../subscription/contracts";
import type { VerifiedWebhookEvent } from "./contracts";
import type { WebhookMutationExecutor } from "./payos-webhook-processor";

export class PostgresWebhookMutationExecutor implements WebhookMutationExecutor {
  public constructor(
    private readonly pool: Pool,
    private readonly paymentLookupRepository: PaymentLookupRepository,
  ) {}

  public async runInTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  public async applyEventWithinTransaction(
    event: VerifiedWebhookEvent,
    tx: unknown,
  ): Promise<void> {
    const client = tx as PoolClient;
    const orderCode = this.readOrderCode(event);

    if (!orderCode) {
      throw new Error("tx_not_found");
    }

    if (!this.isPaidEvent(event)) {
      throw new Error("event_not_paid");
    }

    const payment = await this.paymentLookupRepository.findByOrderCodeForUpdate(orderCode, client);
    if (!payment) {
      throw new Error("tx_not_found");
    }

    const paymentUpdate = await this.paymentLookupRepository.markPaidIfPending(orderCode, client);
    if (paymentUpdate === "not_found") {
      throw new Error("tx_not_found");
    }

    if (paymentUpdate === "already_paid") {
      return;
    }

    const current = await client.query(
      `SELECT tier_expires_at FROM users WHERE firebase_uid = $1 LIMIT 1 FOR UPDATE`,
      [payment.firebaseUid],
    );

    if ((current.rowCount ?? 0) === 0) {
      throw new Error("user_not_found");
    }

    const now = new Date();
    const currentExpiry = current.rows[0]?.tier_expires_at
      ? new Date(current.rows[0].tier_expires_at as string)
      : null;
    const baseDate = currentExpiry && currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
    const nextExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await client.query(
      `UPDATE users SET tier = 'premium', tier_expires_at = $2 WHERE firebase_uid = $1`,
      [payment.firebaseUid, nextExpiry],
    );
  }

  private readOrderCode(event: VerifiedWebhookEvent): number | null {
    const data = (event.payload.data as Record<string, unknown> | undefined) ?? event.payload;
    const value = data.orderCode;
    if (typeof value === "number" && Number.isSafeInteger(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isSafeInteger(parsed) ? parsed : null;
    }
    return null;
  }

  private isPaidEvent(event: VerifiedWebhookEvent): boolean {
    const eventType = event.eventType.toLowerCase();
    const status = String(
      event.payload.status ??
        (event.payload.data as Record<string, unknown> | undefined)?.status ??
        "",
    ).toUpperCase();
    return eventType === "payment.updated" && status === "PAID";
  }
}
