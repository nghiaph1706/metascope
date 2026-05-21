import { describe, expect, it } from "vitest";
import { InMemoryQuotaStore } from "./in-memory-quota-store";

describe("InMemoryQuotaStore", () => {
  it("does not consume quota twice for same idempotency key", async () => {
    const store = new InMemoryQuotaStore();
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
  });

  it("consumes quota for different idempotency keys", async () => {
    const store = new InMemoryQuotaStore();
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
});
