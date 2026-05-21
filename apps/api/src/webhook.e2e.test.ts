import crypto from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./main";

describe("payos webhook endpoint", () => {
  it("returns code 01 for missing signature", async () => {
    const res = await request(app)
      .post("/api/v1/payment/webhook/payos")
      .set("content-type", "application/json")
      .send({
        id: `evt_${crypto.randomUUID()}`,
        type: "payment.updated",
        data: { orderCode: 1001 },
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ code: "01", message: "invalid_signature" });
  });

  it("returns code 00 processed for valid signed webhook", async () => {
    const eventId = `evt_${crypto.randomUUID()}`;

    const res = await request(app)
      .post("/api/v1/payment/webhook/payos")
      .set("content-type", "application/json")
      .set("x-payos-signature", "signed")
      .send({ id: eventId, type: "payment.updated", data: { orderCode: 1002 } });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ code: "00", message: "processed" });
  });

  it("returns duplicate code 00 when same webhook event is replayed", async () => {
    const eventId = `evt_${crypto.randomUUID()}`;

    const first = await request(app)
      .post("/api/v1/payment/webhook/payos")
      .set("content-type", "application/json")
      .set("x-payos-signature", "signed")
      .send({ id: eventId, type: "payment.updated", data: { orderCode: 1003 } });

    const second = await request(app)
      .post("/api/v1/payment/webhook/payos")
      .set("content-type", "application/json")
      .set("x-payos-signature", "signed")
      .send({ id: eventId, type: "payment.updated", data: { orderCode: 1003 } });

    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ code: "00", message: "processed" });
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({ code: "00", message: "duplicate" });
  });

  it("returns tx_not_found_audited code 00 when transaction id is missing", async () => {
    const res = await request(app)
      .post("/api/v1/payment/webhook/payos")
      .set("content-type", "application/json")
      .set("x-payos-signature", "signed")
      .send({ id: `evt_${crypto.randomUUID()}`, type: "payment.updated", data: {} });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ code: "00", message: "tx_not_found_audited" });
  });

  it("returns code 02 for malformed json payload", async () => {
    const res = await request(app)
      .post("/api/v1/payment/webhook/payos")
      .set("content-type", "application/json")
      .set("x-payos-signature", "signed")
      .send("{ invalid-json");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      code: "02",
      message: "accepted_not_applied",
      retry_after: 30,
    });
  });
});
