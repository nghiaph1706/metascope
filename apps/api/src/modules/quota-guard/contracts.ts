export interface QuotaPolicy {
  limit: number;
  windowSeconds: number;
}

export interface QuotaConsumeResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string;
}

export interface QuotaStore {
  consume(input: {
    firebaseUid: string;
    featureKey: string;
    policy: QuotaPolicy;
    now: Date;
  }): Promise<QuotaConsumeResult>;
}
