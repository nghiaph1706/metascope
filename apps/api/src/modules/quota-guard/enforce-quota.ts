import type {
  AuthenticatedRequestLike,
  HttpResponseLike,
  NextFunctionLike,
} from "../auth-boundary/require-auth";
import type { QuotaPolicy, QuotaStore } from "./contracts";

export function enforceQuota(quotaStore: QuotaStore, featureKey: string, policy: QuotaPolicy) {
  return async (
    req: AuthenticatedRequestLike,
    res: HttpResponseLike,
    next: NextFunctionLike,
  ): Promise<void> => {
    if (!req.principal) {
      res.status(401).json({ code: "unauthorized" });
      return;
    }

    const result = await quotaStore.consume({
      firebaseUid: req.principal.firebaseUid,
      featureKey,
      policy,
      now: new Date(),
    });

    if (!result.allowed) {
      const retryAfterSeconds = Math.max(
        Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000),
        1,
      );

      res.status(429).json({
        code: "QUOTA_EXCEEDED",
        message: "Quota exceeded",
        feature: featureKey,
        limit: result.limit,
        remaining: 0,
        resetAt: result.resetAt,
        retryAfterSeconds,
      });
      return;
    }

    next();
  };
}
