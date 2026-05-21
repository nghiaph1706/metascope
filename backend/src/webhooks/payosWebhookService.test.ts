import crypto from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { PayOSWebhookService } from "./payosWebhookService";
import { DuplicateWebhookError } from "./postgresWebhookDb";
import { PayOSWebhookPayload, WebhookDb } from "./types";

const checksumKey = "k";

const basePayload: PayOSWebhookPayload = {
  code: "00",
  success: true,
  event_id: "evt_123",
  data: {
    orderCode: 123,
    amount: 99000,
    transactionDateTime: "2026-05-21 10:00:00",
  },
};

const baseRawBody = Buffer.from(JSON.stringify(basePayload));
const baseSignature = crypto.createHmac("sha256", checksumKey).update(baseRawBody).digest("hex");

function mockDb(): WebhookDb & { __tx: any } {
  const tx = {
    markProcessed: vi.fn(async () => undefined),
    updatePaymentCompleted: vi.fn(async () => true),
    getUserById: vi.fn(async () => ({ id: "u1", tier: "basic" as const, tier_expires_at: null })),
    updateUserPremium: vi.fn(async () => undefined),
    insertEntitlementLedger: vi.fn(async () => undefined),
  };

  return {
    findTransactionByOrderCode: vi.fn(async () => ({
      id: "tx1",
      user_id: "u1",
      order_code: 123,
      status: "pending" as const,
    })),
    hasProcessedWebhook: vi.fn(async () => false),
    inTransaction: async <T>(fn: (txArg: typeof tx) => Promise<T>): Promise<T> => fn(tx),
    insertWebhookAudit: vi.fn(async () => undefined),
    __tx: tx,
  };
}

describe("PayOSWebhookService", () => {
  it("returns 01 for invalid signature without mutation", async () => {
    const db = mockDb();
    const service = new PayOSWebhookService(db, "k");
    const res = await service.handleWebhook(basePayload, baseRawBody, "bad");
    expect(res.code).toBe("01");
    expect(db.hasProcessedWebhook).not.toHaveBeenCalled();
  });

  it("returns 00 for duplicate event", async () => {
    const db = mockDb();
    (db.hasProcessedWebhook as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const service = new PayOSWebhookService(db, "k");
    const res = await service.handleWebhook(basePayload, baseRawBody, baseSignature);
    expect(res.code).toBe("00");
  });

  it("returns 00 and writes audit when tx not found", async () => {
    const db = mockDb();
    (db.findTransactionByOrderCode as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const service = new PayOSWebhookService(db, "k");
    const res = await service.handleWebhook(basePayload, baseRawBody, baseSignature);
    expect(res.code).toBe("00");
    expect(db.insertWebhookAudit).toHaveBeenCalled();
  });

  it("returns 02 with retry_after seconds on transient failure", async () => {
    const db = mockDb();
    db.inTransaction = async () => {
      throw new Error("db down");
    };
    const service = new PayOSWebhookService(db, "k");
    const res = await service.handleWebhook(basePayload, baseRawBody, baseSignature);
    expect(res).toMatchObject({ code: "02", retry_after: 15 });
  });

  it("returns 00 when markProcessed detects duplicate in transaction", async () => {
    const db = mockDb();
    db.__tx.markProcessed.mockRejectedValue(new DuplicateWebhookError());
    const service = new PayOSWebhookService(db, "k");
    const res = await service.handleWebhook(basePayload, baseRawBody, baseSignature);
    expect(res.code).toBe("00");
    expect(res.desc).toBe("already processed");
  });

  it("applies premium mutation on success path", async () => {
    const db = mockDb();
    const service = new PayOSWebhookService(db, "k");
    const res = await service.handleWebhook(basePayload, baseRawBody, baseSignature);

    expect(res.code).toBe("00");
    expect(db.__tx.markProcessed).toHaveBeenCalledWith("payos", basePayload.event_id);
    expect(db.__tx.updatePaymentCompleted).toHaveBeenCalledWith(
      basePayload.data.orderCode,
      basePayload.data.transactionDateTime,
    );
    expect(db.__tx.updateUserPremium).toHaveBeenCalledTimes(1);
    expect(db.__tx.insertEntitlementLedger).toHaveBeenCalledTimes(1);
  });
});
