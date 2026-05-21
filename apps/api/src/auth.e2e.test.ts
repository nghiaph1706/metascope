import crypto from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, entitlementEditor } from "./main";

function createToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

describe("auth endpoints", () => {
  it("returns unauthorized when auth header missing", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ code: "unauthorized" });
  });

  it("syncs profile and returns canonical me", async () => {
    const firebaseUid = `uid_${crypto.randomUUID()}`;
    const token = createToken({ sub: firebaseUid, email: "test@example.com" });

    const syncRes = await request(app)
      .post("/api/v1/auth/sync-profile")
      .set("authorization", `Bearer ${token}`)
      .send({ displayName: "Nghia", avatarUrl: "https://cdn.example/avatar.png" });

    expect(syncRes.status).toBe(200);
    expect(syncRes.body).toMatchObject({
      firebaseUid,
      email: "test@example.com",
      displayName: "Nghia",
      avatarUrl: "https://cdn.example/avatar.png",
      tier: "basic",
      tierExpiresAt: null,
    });

    const meRes = await request(app).get("/api/v1/auth/me").set("authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body).toMatchObject({
      firebaseUid,
      email: "test@example.com",
      displayName: "Nghia",
      avatarUrl: "https://cdn.example/avatar.png",
      tier: "basic",
      tierExpiresAt: null,
    });
  });

  it("rejects invalid sync payload", async () => {
    const token = createToken({ sub: "uid_invalid", email: "test@example.com" });

    const res = await request(app)
      .post("/api/v1/auth/sync-profile")
      .set("authorization", `Bearer ${token}`)
      .send({ displayName: 123 });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: "invalid_payload" });
  });

  it("blocks premium route when entitlement missing", async () => {
    const token = createToken({ sub: `uid_${crypto.randomUUID()}` });
    const res = await request(app)
      .get("/api/v1/tools/premium-demo")
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: "forbidden", reason: "entitlement_missing" });
  });

  it("enforces quota on premium route", async () => {
    const firebaseUid = `uid_${crypto.randomUUID()}`;
    entitlementEditor?.setEntitlement({
      firebaseUid,
      tier: "premium",
      tierExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    const token = createToken({ sub: firebaseUid });

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app)
        .get("/api/v1/tools/premium-demo")
        .set("authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    }

    const exceeded = await request(app)
      .get("/api/v1/tools/premium-demo")
      .set("authorization", `Bearer ${token}`);

    expect(exceeded.status).toBe(429);
    expect(exceeded.body).toMatchObject({
      code: "QUOTA_EXCEEDED",
      feature: "premium_demo",
      limit: 5,
      remaining: 0,
    });
  });
});
