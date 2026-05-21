import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { PostgresProcessedWebhookRepository } from "./postgres-processed-webhook-repository";
import { PostgresSecurityAuditLogger } from "./postgres-security-audit-logger";
import { PostgresWebhookMutationExecutor } from "./postgres-webhook-mutation-executor";
import { PostgresPaymentTransactionRepository } from "../subscription/postgres-payment-transaction-repository";
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        firebase_uid TEXT PRIMARY KEY,
        tier TEXT NOT NULL DEFAULT 'free',
        tier_expires_at TIMESTAMPTZ
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id BIGSERIAL PRIMARY KEY,
        firebase_uid TEXT NOT NULL,
        order_code BIGINT NOT NULL UNIQUE,
        amount INTEGER NOT NULL,
        plan_type TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
        payment_link_id TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query("DELETE FROM payment_transactions");
    await pool.query("DELETE FROM users");
    await pool.query("DELETE FROM payment_webhook_processed");
    await pool.query("DELETE FROM payment_webhook_audit_log");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM payment_transactions");
    await pool.query("DELETE FROM users");
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

  it("applies paid mutation once and extends user tier from now", async () => {
    const paymentRepository = new PostgresPaymentTransactionRepository(pool);
    const executor = new PostgresWebhookMutationExecutor(pool, paymentRepository);

    const firebaseUid = "uid_integration_paid_1";
    const orderCode = 770001;

    await pool.query(
      `INSERT INTO users(firebase_uid, tier, tier_expires_at) VALUES ($1, 'free', NULL)`,
      [firebaseUid],
    );
    await pool.query(
      `INSERT INTO payment_transactions(firebase_uid, order_code, amount, plan_type, status, expires_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW() + INTERVAL '15 minutes')`,
      [firebaseUid, orderCode, 99000, "premium_monthly"],
    );

    const beforeMutation = new Date();
    await executor.runInTransaction((tx) =>
      executor.applyEventWithinTransaction(
        {
          provider: "payos",
          eventId: "evt_paid_mutation_once",
          eventType: "payment.updated",
          transactionId: String(orderCode),
          rawBody: "{}",
          payload: { status: "PAID", data: { orderCode } },
        },
        tx,
      ),
    );
    const afterMutation = new Date();

    const paymentResult = await pool.query(
      `SELECT status, paid_at FROM payment_transactions WHERE order_code = $1 LIMIT 1`,
      [orderCode],
    );
    const userResult = await pool.query(
      `SELECT tier, tier_expires_at FROM users WHERE firebase_uid = $1 LIMIT 1`,
      [firebaseUid],
    );

    expect(paymentResult.rowCount).toBe(1);
    expect(paymentResult.rows[0].status).toBe("paid");
    expect(paymentResult.rows[0].paid_at).toBeTruthy();

    expect(userResult.rowCount).toBe(1);
    expect(userResult.rows[0].tier).toBe("premium");
    expect(userResult.rows[0].tier_expires_at).toBeTruthy();

    const tierExpiry = new Date(String(userResult.rows[0].tier_expires_at));
    const minExpected = new Date(beforeMutation.getTime() + 29 * 24 * 60 * 60 * 1000);
    const maxExpected = new Date(afterMutation.getTime() + 31 * 24 * 60 * 60 * 1000);
    expect(tierExpiry.getTime()).toBeGreaterThanOrEqual(minExpected.getTime());
    expect(tierExpiry.getTime()).toBeLessThanOrEqual(maxExpected.getTime());
  });

  it("does not apply paid mutation twice for already-paid transaction", async () => {
    const paymentRepository = new PostgresPaymentTransactionRepository(pool);
    const executor = new PostgresWebhookMutationExecutor(pool, paymentRepository);

    const firebaseUid = "uid_integration_paid_2";
    const orderCode = 770002;
    const initialExpiry = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString();

    await pool.query(
      `INSERT INTO users(firebase_uid, tier, tier_expires_at) VALUES ($1, 'premium', $2)`,
      [firebaseUid, initialExpiry],
    );
    await pool.query(
      `INSERT INTO payment_transactions(firebase_uid, order_code, amount, plan_type, status, expires_at, paid_at)
       VALUES ($1, $2, $3, $4, 'paid', NOW() + INTERVAL '15 minutes', NOW())`,
      [firebaseUid, orderCode, 99000, "premium_monthly"],
    );

    await executor.runInTransaction((tx) =>
      executor.applyEventWithinTransaction(
        {
          provider: "payos",
          eventId: "evt_paid_mutation_twice",
          eventType: "payment.updated",
          transactionId: String(orderCode),
          rawBody: "{}",
          payload: { status: "PAID", data: { orderCode } },
        },
        tx,
      ),
    );

    const paymentResult = await pool.query(
      `SELECT status FROM payment_transactions WHERE order_code = $1 LIMIT 1`,
      [orderCode],
    );
    const userResult = await pool.query(
      `SELECT tier_expires_at FROM users WHERE firebase_uid = $1 LIMIT 1`,
      [firebaseUid],
    );

    expect(paymentResult.rowCount).toBe(1);
    expect(paymentResult.rows[0].status).toBe("paid");
    expect(
      Math.abs(
        new Date(String(userResult.rows[0].tier_expires_at)).getTime() -
          new Date(initialExpiry).getTime(),
      ),
    ).toBeLessThan(1000);
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
