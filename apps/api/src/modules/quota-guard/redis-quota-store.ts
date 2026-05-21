import Redis from "ioredis";
import type { QuotaConsumeResult, QuotaPolicy, QuotaStore } from "./contracts";

export class RedisQuotaStore implements QuotaStore {
  constructor(private readonly redis: Redis) {}

  async consume(input: {
    firebaseUid: string;
    featureKey: string;
    policy: QuotaPolicy;
    now: Date;
    idempotencyKey?: string;
  }): Promise<QuotaConsumeResult> {
    const key = this.buildKey(input.firebaseUid, input.featureKey);
    const ttl = input.policy.windowSeconds;

    const lua = `
      local current = tonumber(redis.call('GET', KEYS[1]) or '0')
      if ARGV[2] ~= '' then
        local markerKey = KEYS[1] .. ':idem:' .. ARGV[2]
        if redis.call('EXISTS', markerKey) == 1 then
          local ttlExisting = redis.call('TTL', KEYS[1])
          return {current, ttlExisting}
        end

        local next = redis.call('INCR', KEYS[1])
        if next == 1 then
          redis.call('EXPIRE', KEYS[1], ARGV[1])
        end
        redis.call('SET', markerKey, '1', 'EX', ARGV[1])
        local ttlNext = redis.call('TTL', KEYS[1])
        return {next, ttlNext}
      end

      local next = redis.call('INCR', KEYS[1])
      if next == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      local ttlNext = redis.call('TTL', KEYS[1])
      return {next, ttlNext}
    `;

    const raw = (await this.redis.eval(lua, 1, key, ttl, input.idempotencyKey ?? "")) as [
      number,
      number,
    ];
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
