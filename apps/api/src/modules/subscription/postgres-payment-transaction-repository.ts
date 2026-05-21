import type { Pool, PoolClient } from "pg";
import type {
  PaymentLookupRepository,
  PaymentTransactionRecord,
  PaymentTransactionRepository,
  PendingPaymentTransaction,
} from "./contracts";

export class PostgresPaymentTransactionRepository
  implements PaymentTransactionRepository, PaymentLookupRepository
{
  public constructor(private readonly pool: Pool) {}

  public async existsByOrderCode(orderCode: number): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT 1 FROM payment_transactions WHERE order_code = $1 LIMIT 1`,
      [orderCode],
    );
    return (result.rowCount ?? 0) > 0;
  }

  public async createPending(tx: PendingPaymentTransaction): Promise<void> {
    await this.pool.query(
      `INSERT INTO payment_transactions(firebase_uid, order_code, amount, plan_type, status, payment_link_id, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        tx.firebaseUid,
        tx.orderCode,
        tx.amount,
        tx.planType,
        tx.status,
        tx.paymentLinkId ?? null,
        tx.expiresAt,
      ],
    );
  }

  public async findByOrderCodeForUpdate(
    orderCode: number,
    tx: unknown,
  ): Promise<PaymentTransactionRecord | null> {
    const client = tx as PoolClient;
    const result = await client.query(
      `SELECT firebase_uid, order_code, amount, plan_type, status, payment_link_id, expires_at
       FROM payment_transactions WHERE order_code = $1 LIMIT 1 FOR UPDATE`,
      [orderCode],
    );

    if ((result.rowCount ?? 0) === 0) {
      return null;
    }

    const row = result.rows[0] as {
      firebase_uid: string;
      order_code: number;
      amount: number;
      plan_type: "premium_monthly";
      status: "pending" | "paid";
      payment_link_id: string | null;
      expires_at: string;
    };

    return {
      firebaseUid: row.firebase_uid,
      orderCode: row.order_code,
      amount: row.amount,
      planType: row.plan_type,
      status: row.status,
      paymentLinkId: row.payment_link_id ?? undefined,
      expiresAt: row.expires_at,
    };
  }

  public async markPaidIfPending(
    orderCode: number,
    tx: unknown,
  ): Promise<"updated" | "already_paid" | "not_found"> {
    const client = tx as PoolClient;
    const result = await client.query(
      `UPDATE payment_transactions
       SET status = 'paid', paid_at = NOW(), updated_at = NOW()
       WHERE order_code = $1 AND status = 'pending'`,
      [orderCode],
    );

    if ((result.rowCount ?? 0) > 0) {
      return "updated";
    }

    const existing = await client.query(
      `SELECT status FROM payment_transactions WHERE order_code = $1 LIMIT 1`,
      [orderCode],
    );

    if ((existing.rowCount ?? 0) === 0) {
      return "not_found";
    }

    return "already_paid";
  }
}
