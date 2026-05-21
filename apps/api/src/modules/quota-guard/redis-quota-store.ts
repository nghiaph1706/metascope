import Redis from "ioredis";
import type { QuotaConsumeResult, QuotaPolicy, QuotaStore } from "./contracts";

export class RedisQuotaStore implements QuotaStore {
  constructor(private readonly redis: Redis) {}

  async consume(input: {
    firebaseUid: string;
    featureKey: string;
    policy: QuotaPolicy;
    now: Date;
  }): Promise<QuotaConsumeResult> {
    const key = this.buildKey(input.firebaseUid, input.featureKey);
    const ttl = input.policy.windowSeconds;

    const lua = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      local ttl = redis.call('TTL', KEYS[1])
      return {current, ttl}
    `;

    const raw = (await this.redis.eval(lua, 1, key, ttl)) as [number, number];
    const current = Number(raw[1 - 1]);
    const remaining = Math.max(input.policy.limit - current, 0);
    const ttlRemaining = Number(raw[2 - 1]);
    const ttlSeconds = ttlRemaining > 0 ? ttlRemaining : ttl;
    const resetAt = new Date(input.now.getTime() + ttlSeconds * 1000).toISOString();

    return {
      allowed: current <= input.policy.limit,
      remaining,
      limit: input.policy.limit,
      resetAt,
    };
  }

  private buildKey(firebaseUid: string, featureKey: string): string {
    return `quota:${featureKey}:${firebaseUid}`;
  }
}
