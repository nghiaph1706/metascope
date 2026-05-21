import type { QuotaConsumeResult, QuotaPolicy, QuotaStore } from "./contracts";

interface QuotaBucket {
  count: number;
  resetAtMs: number;
  processedKeys: Set<string>;
}

export class InMemoryQuotaStore implements QuotaStore {
  private readonly buckets = new Map<string, QuotaBucket>();

  async consume(input: {
    firebaseUid: string;
    featureKey: string;
    policy: QuotaPolicy;
    now: Date;
    idempotencyKey?: string;
  }): Promise<QuotaConsumeResult> {
    const key = this.buildKey(input.firebaseUid, input.featureKey);
    const nowMs = input.now.getTime();
    const windowMs = input.policy.windowSeconds * 1000;
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAtMs <= nowMs) {
      const resetAtMs = nowMs + windowMs;
      const processedKeys = new Set<string>();
      if (input.idempotencyKey) {
        processedKeys.add(input.idempotencyKey);
      }
      this.buckets.set(key, { count: 1, resetAtMs, processedKeys });
      return {
        allowed: true,
        remaining: Math.max(input.policy.limit - 1, 0),
        limit: input.policy.limit,
        resetAt: new Date(resetAtMs).toISOString(),
      };
    }

    if (input.idempotencyKey && existing.processedKeys.has(input.idempotencyKey)) {
      return {
        allowed: true,
        remaining: Math.max(input.policy.limit - existing.count, 0),
        limit: input.policy.limit,
        resetAt: new Date(existing.resetAtMs).toISOString(),
      };
    }

    if (existing.count >= input.policy.limit) {
      return {
        allowed: false,
        remaining: 0,
        limit: input.policy.limit,
        resetAt: new Date(existing.resetAtMs).toISOString(),
      };
    }

    existing.count += 1;
    if (input.idempotencyKey) {
      existing.processedKeys.add(input.idempotencyKey);
    }
    this.buckets.set(key, existing);
    return {
      allowed: true,
      remaining: Math.max(input.policy.limit - existing.count, 0),
      limit: input.policy.limit,
      resetAt: new Date(existing.resetAtMs).toISOString(),
    };
  }

  private buildKey(firebaseUid: string, featureKey: string): string {
    return `${firebaseUid}:${featureKey}`;
  }
}
