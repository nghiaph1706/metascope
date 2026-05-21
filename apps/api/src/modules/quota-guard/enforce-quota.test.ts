import { describe, expect, it, vi } from "vitest";
import { enforceQuota } from "./enforce-quota";
import type { QuotaStore } from "./contracts";

function createResponseDouble() {
  const statuses: number[] = [];
  const payloads: unknown[] = [];
  return {
    status(code: number) {
      statuses.push(code);
      return this;
    },
    json(payload: unknown) {
      payloads.push(payload);
      return this;
    },
    get statuses() {
      return statuses;
    },
    get payloads() {
      return payloads;
    },
  };
}

describe("enforceQuota", () => {
  it("forwards idempotency key to quota store", async () => {
    const consume = vi.fn().mockResolvedValue({
      allowed: true,
      remaining: 4,
      limit: 5,
      resetAt: new Date(Date.now() + 60_000).toISOString(),
    });
    const quotaStore: QuotaStore = { consume };

    const middleware = enforceQuota(quotaStore, "premium_demo", { limit: 5, windowSeconds: 60 });
    const res = createResponseDouble();
    const next = vi.fn();

    await middleware(
      {
        headers: { "idempotency-key": "req-123" },
        principal: { firebaseUid: "uid_1" },
      },
      res,
      next,
    );

    expect(consume).toHaveBeenCalledTimes(1);
    expect(consume.mock.calls[0][0]).toMatchObject({
      firebaseUid: "uid_1",
      featureKey: "premium_demo",
      idempotencyKey: "req-123",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
