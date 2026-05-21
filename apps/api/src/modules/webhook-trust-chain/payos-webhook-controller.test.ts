import { describe, expect, it, vi } from "vitest";
import { PayOSWebhookController } from "./payos-webhook-controller";
import type { VerifiedWebhookEvent, WebhookSignatureVerifier } from "./contracts";
import type { PayOSWebhookProcessor } from "./payos-webhook-processor";

function createResponseDouble() {
  const body: unknown[] = [];
  const statusValues: number[] = [];
  return {
    status(code: number) {
      statusValues.push(code);
      return this;
    },
    json(payload: unknown) {
      body.push(payload);
      return this;
    },
    get statusValues() {
      return statusValues;
    },
    get body() {
      return body;
    },
  };
}

describe("PayOSWebhookController", () => {
  it("returns ack 01 when signature is invalid", async () => {
    const verifier: WebhookSignatureVerifier = {
      verify: vi.fn().mockRejectedValue(new Error("invalid_signature")),
    };
    const processor = {
      processVerifiedEvent: vi.fn(),
    } as unknown as PayOSWebhookProcessor;

    const controller = new PayOSWebhookController(verifier, processor);
    const res = createResponseDouble();

    await controller.handleWebhook(
      {
        headers: { "x-payos-signature": "bad" },
        rawBody: "{}",
      },
      res,
    );

    expect(res.statusValues.at(-1)).toBe(200);
    expect(res.body.at(-1)).toMatchObject({ code: "01", message: "invalid_signature" });
    expect(processor.processVerifiedEvent).not.toHaveBeenCalled();
  });

  it("returns processor ack when event is verified", async () => {
    const event: VerifiedWebhookEvent = {
      provider: "payos",
      eventId: "evt_1",
      eventType: "payment.updated",
      transactionId: "1001",
      rawBody: "{}",
      payload: {},
    };

    const verifier: WebhookSignatureVerifier = {
      verify: vi.fn().mockResolvedValue(event),
    };
    const processor = {
      processVerifiedEvent: vi.fn().mockResolvedValue({ code: "00", message: "processed" }),
    } as unknown as PayOSWebhookProcessor;

    const controller = new PayOSWebhookController(verifier, processor);
    const res = createResponseDouble();

    await controller.handleWebhook(
      {
        headers: { "x-payos-signature": "ok" },
        rawBody: "{}",
      },
      res,
    );

    expect(res.statusValues.at(-1)).toBe(200);
    expect(res.body.at(-1)).toMatchObject({ code: "00", message: "processed" });
  });

  it("returns ack 02 with retry_after for transient error", async () => {
    const verifier: WebhookSignatureVerifier = {
      verify: vi.fn().mockResolvedValue({
        provider: "payos",
        eventId: "evt_2",
        eventType: "payment.updated",
        rawBody: "{}",
        payload: {},
      }),
    };

    const processor = {
      processVerifiedEvent: vi.fn().mockRejectedValue(new Error("db_unavailable")),
    } as unknown as PayOSWebhookProcessor;

    const controller = new PayOSWebhookController(verifier, processor);
    const res = createResponseDouble();

    await controller.handleWebhook(
      {
        headers: { "x-payos-signature": "ok" },
        rawBody: "{}",
      },
      res,
    );

    expect(res.statusValues.at(-1)).toBe(200);
    expect(res.body.at(-1)).toMatchObject({
      code: "02",
      message: "accepted_not_applied",
      retry_after: 30,
    });
  });
});
