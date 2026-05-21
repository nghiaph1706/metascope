import crypto from "node:crypto";
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createPayOSWebhookRouter } from "./payosWebhookExpressAdapter";
import { PayOSWebhookService } from "./payosWebhookService";
import { PayOSWebhookPayload, WebhookDb } from "./types";

const checksumKey = "k";

function mockDb(): WebhookDb {
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
  };
}

function createSignedBody(overrides?: Partial<PayOSWebhookPayload>) {
  const payload: PayOSWebhookPayload = {
    code: "00",
    success: true,
    event_id: "evt_123",
    data: { orderCode: 123, amount: 1000, transactionDateTime: "2026-05-21 10:00:00" },
    ...overrides,
  };
  const raw = Buffer.from(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", checksumKey).update(raw).digest("hex");
  return { payload, raw, signature };
}

describe("PayOS webhook express adapter", () => {
  it("returns 01 when signature header missing", async () => {
    const app = express();
    const service = new PayOSWebhookService(mockDb(), checksumKey);
    app.use(
      "/api/v1/webhooks/payos",
      express.raw({ type: "application/json" }),
      createPayOSWebhookRouter(service),
    );

    const { raw } = createSignedBody();
    const res = await request(app)
      .post("/api/v1/webhooks/payos")
      .set("content-type", "application/json")
      .send(raw);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("01");
  });

  it("returns 01 for invalid payload shape", async () => {
    const app = express();
    const service = new PayOSWebhookService(mockDb(), checksumKey);
    app.use(
      "/api/v1/webhooks/payos",
      express.raw({ type: "application/json" }),
      createPayOSWebhookRouter(service),
    );

    const raw = Buffer.from(JSON.stringify({ foo: "bar" }));
    const signature = crypto.createHmac("sha256", checksumKey).update(raw).digest("hex");
    const res = await request(app)
      .post("/api/v1/webhooks/payos")
      .set("content-type", "application/json")
      .set("x-payos-signature", signature)
      .send(raw);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("01");
  });

  it("returns 01 when raw body and signature mismatch", async () => {
    const app = express();
    const service = new PayOSWebhookService(mockDb(), checksumKey);
    app.use(
      "/api/v1/webhooks/payos",
      express.raw({ type: "application/json" }),
      createPayOSWebhookRouter(service),
    );

    const { raw, signature } = createSignedBody();
    const tamperedRaw = Buffer.from(raw.toString("utf8").replace('"amount":1000', '"amount":2000'));
    const res = await request(app)
      .post("/api/v1/webhooks/payos")
      .set("content-type", "application/json")
      .set("x-payos-signature", signature)
      .send(tamperedRaw);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("01");
  });
});
