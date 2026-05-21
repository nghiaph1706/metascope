import { describe, expect, it, vi } from "vitest";
import { RedisQuotaStore } from "./redis-quota-store";

describe("RedisQuotaStore", () => {
  it("does not consume quota twice for same idempotency key", async () => {
    const evalMock = vi.fn().mockResolvedValueOnce([1, 60]).mockResolvedValueOnce([1, 59]);

    const store = new RedisQuotaStore({ eval: evalMock } as any);
    const now = new Date("2026-05-21T00:00:00.000Z");

    const first = await store.consume({
      firebaseUid: "uid_1",
      featureKey: "premium_demo",
      policy: { limit: 5, windowSeconds: 60 },
      now,
      idempotencyKey: "req-1",
    });

    const second = await store.consume({
      firebaseUid: "uid_1",
      featureKey: "premium_demo",
      policy: { limit: 5, windowSeconds: 60 },
      now,
      idempotencyKey: "req-1",
    });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(4);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(4);
    expect(evalMock).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      1,
      "quota:premium_demo:uid_1",
      60,
      "req-1",
    );
    expect(evalMock).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      1,
      "quota:premium_demo:uid_1",
      60,
      "req-1",
    );
  });

  it("consumes quota for different idempotency keys", async () => {
    const evalMock = vi.fn().mockResolvedValueOnce([1, 60]).mockResolvedValueOnce([2, 59]);

    const store = new RedisQuotaStore({ eval: evalMock } as any);
    const now = new Date("2026-05-21T00:00:00.000Z");

    const first = await store.consume({
      firebaseUid: "uid_1",
      featureKey: "premium_demo",
      policy: { limit: 5, windowSeconds: 60 },
      now,
      idempotencyKey: "req-1",
    });

    const second = await store.consume({
      firebaseUid: "uid_1",
      featureKey: "premium_demo",
      policy: { limit: 5, windowSeconds: 60 },
      now,
      idempotencyKey: "req-2",
    });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(4);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(3);
  });

  it("consumes quota normally when idempotency key is missing", async () => {
    const evalMock = vi.fn().mockResolvedValueOnce([1, 60]).mockResolvedValueOnce([2, 59]);

    const store = new RedisQuotaStore({ eval: evalMock } as any);
    const now = new Date("2026-05-21T00:00:00.000Z");

    const first = await store.consume({
      firebaseUid: "uid_1",
      featureKey: "premium_demo",
      policy: { limit: 5, windowSeconds: 60 },
      now,
    });

    const second = await store.consume({
      firebaseUid: "uid_1",
      featureKey: "premium_demo",
      policy: { limit: 5, windowSeconds: 60 },
      now,
    });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(4);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(3);
    expect(evalMock).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      1,
      "quota:premium_demo:uid_1",
      60,
      "",
    );
  });
});
