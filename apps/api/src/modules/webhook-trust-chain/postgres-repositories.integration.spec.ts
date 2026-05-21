import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { PostgresProcessedWebhookRepository } from "./postgres-processed-webhook-repository";
import { PostgresSecurityAuditLogger } from "./postgres-security-audit-logger";
import type { VerifiedWebhookEvent } from "./contracts";

const databaseUrl = process.env.DATABASE_URL;
const runIntegration = Boolean(databaseUrl);
const describeIfDb = runIntegration ? describe : describe.skip;

describeIfDb("webhook postgres repositories integration", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_webhook_processed (
        provider TEXT NOT NULL,
        event_id TEXT NOT NULL,
        processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (provider, event_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_webhook_audit_log (
        id BIGSERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        event_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        transaction_id TEXT,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query("DELETE FROM payment_webhook_processed");
    await pool.query("DELETE FROM payment_webhook_audit_log");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM payment_webhook_processed");
    await pool.query("DELETE FROM payment_webhook_audit_log");
    await pool.end();
  });

  it("persists and reads processed webhook by composite key", async () => {
    const repository = new PostgresProcessedWebhookRepository(pool);

    const before = await repository.hasBeenProcessed("payos", "evt_integration_1");
    expect(before).toBe(false);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await repository.markProcessedWithinTransaction("payos", "evt_integration_1", client);
      await client.query("COMMIT");
    } finally {
      client.release();
    }

    const after = await repository.hasBeenProcessed("payos", "evt_integration_1");
    expect(after).toBe(true);
  });

  it("is idempotent for sequential replay with same eventId", async () => {
    const repository = new PostgresProcessedWebhookRepository(pool);
    const eventId = "evt_integration_replay_seq";

    const markProcessedInOwnTransaction = async (): Promise<void> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await repository.markProcessedWithinTransaction("payos", eventId, client);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    };

    await markProcessedInOwnTransaction();
    await markProcessedInOwnTransaction();

    const after = await repository.hasBeenProcessed("payos", eventId);
    const count = await pool.query(
      "SELECT COUNT(*)::int AS count FROM payment_webhook_processed WHERE provider = $1 AND event_id = $2",
      ["payos", eventId],
    );

    expect(after).toBe(true);
    expect(count.rows[0].count).toBe(1);
  });

  it("does not double-apply under near-concurrency with same eventId", async () => {
    const repository = new PostgresProcessedWebhookRepository(pool);
    const eventId = "evt_integration_replay_concurrent";

    const markProcessedInOwnTransaction = async (): Promise<void> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await repository.markProcessedWithinTransaction("payos", eventId, client);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    };

    await Promise.all([markProcessedInOwnTransaction(), markProcessedInOwnTransaction()]);

    const after = await repository.hasBeenProcessed("payos", eventId);
    const count = await pool.query(
      "SELECT COUNT(*)::int AS count FROM payment_webhook_processed WHERE provider = $1 AND event_id = $2",
      ["payos", eventId],
    );

    expect(after).toBe(true);
    expect(count.rows[0].count).toBe(1);
  });

  it("writes transaction-not-found audit log", async () => {
    const logger = new PostgresSecurityAuditLogger(pool);

    const event: VerifiedWebhookEvent = {
      provider: "payos",
      eventId: "evt_integration_2",
      eventType: "payment.updated",
      transactionId: "order_1002",
      rawBody: "{}",
      payload: {},
    };

    await logger.logTransactionNotFound(event);

    const result = await pool.query(
      `SELECT provider, event_id, event_type, transaction_id, reason FROM payment_webhook_audit_log WHERE provider = $1 AND event_id = $2 LIMIT 1`,
      ["payos", "evt_integration_2"],
    );

    expect(result.rowCount).toBe(1);
    expect(result.rows[0]).toMatchObject({
      provider: "payos",
      event_id: "evt_integration_2",
      event_type: "payment.updated",
      transaction_id: "order_1002",
      reason: "transaction_not_found",
    });
  });
});
