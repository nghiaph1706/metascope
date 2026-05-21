import { DuplicateWebhookError } from "./postgresWebhookDb";
import { AckResponse, PayOSWebhookPayload, WebhookDb } from "./types";
import { verifyPayOSSignatureRaw } from "./verifyPayosSignature";

export class PayOSWebhookService {
  constructor(
    private readonly db: WebhookDb,
    private readonly checksumKey: string,
    private readonly logger: Pick<typeof console, "info" | "warn" | "error"> = console,
  ) {}

  async handleWebhook(
    payload: PayOSWebhookPayload,
    rawBody: Buffer,
    signature: string,
  ): Promise<AckResponse> {
    const signatureOk = verifyPayOSSignatureRaw(rawBody, signature, this.checksumKey);
    if (!signatureOk) {
      return { code: "01", desc: "invalid signature" };
    }

    if (payload.code !== "00" || !payload.success) {
      return { code: "00", desc: "acknowledged" };
    }

    const duplicate = await this.db.hasProcessedWebhook("payos", payload.event_id);
    if (duplicate) {
      return { code: "00", desc: "already processed" };
    }

    const tx = await this.db.findTransactionByOrderCode(payload.data.orderCode);
    if (!tx) {
      await this.db.insertWebhookAudit({
        provider: "payos",
        event_id: payload.event_id,
        order_code: payload.data.orderCode,
        reason: "tx_not_found",
        payload,
      });
      this.logger.warn("payos webhook transaction not found", {
        event_id: payload.event_id,
        order_code: payload.data.orderCode,
      });
      return { code: "00", desc: "acknowledged" };
    }

    try {
      await this.db.inTransaction(async (trx) => {
        await trx.markProcessed("payos", payload.event_id);
        const paymentUpdated = await trx.updatePaymentCompleted(
          payload.data.orderCode,
          payload.data.transactionDateTime,
        );
        if (!paymentUpdated) {
          throw new Error(`payment_not_updated:${payload.data.orderCode}`);
        }

        const user = await trx.getUserById(tx.user_id);
        if (!user) {
          throw new Error(`user not found for tx ${tx.id}`);
        }

        const now = new Date();
        const currentExpiry = user.tier_expires_at ? new Date(user.tier_expires_at) : null;
        const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
        const nextExpiry = new Date(base);
        nextExpiry.setMonth(nextExpiry.getMonth() + 1);
        const expiresAfter = nextExpiry.toISOString();

        await trx.updateUserPremium(user.id, expiresAfter);
        await trx.insertEntitlementLedger({
          user_id: user.id,
          source: "payos_webhook",
          action: user.tier === "premium" ? "extend" : "grant",
          tier_before: user.tier,
          tier_after: "premium",
          expires_before: user.tier_expires_at,
          expires_after: expiresAfter,
          reference_id: String(payload.data.orderCode),
        });
      });
    } catch (error) {
      if (error instanceof DuplicateWebhookError) {
        return { code: "00", desc: "already processed" };
      }

      this.logger.error("payos webhook transient failure", {
        event_id: payload.event_id,
        error,
      });
      return { code: "02", desc: "transient internal failure", retry_after: 15 };
    }

    return { code: "00", desc: "success" };
  }
}
