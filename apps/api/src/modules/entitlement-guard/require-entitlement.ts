import type {
  AuthenticatedRequestLike,
  HttpResponseLike,
  NextFunctionLike,
} from "../auth-boundary/require-auth";
import type { EntitlementReader, EntitlementTier } from "./contracts";

const tierWeight: Record<EntitlementTier, number> = {
  basic: 0,
  premium: 1,
};

export function requireEntitlement(
  entitlementReader: EntitlementReader,
  minimumTier: EntitlementTier,
) {
  return async (
    req: AuthenticatedRequestLike,
    res: HttpResponseLike,
    next: NextFunctionLike,
  ): Promise<void> => {
    if (!req.principal) {
      res.status(401).json({ code: "unauthorized" });
      return;
    }

    const entitlement = await entitlementReader.getEntitlementByFirebaseUid(
      req.principal.firebaseUid,
    );
    if (!entitlement) {
      res.status(403).json({ code: "forbidden", reason: "entitlement_missing" });
      return;
    }

    const now = new Date();
    const expiresAt = entitlement.tierExpiresAt ? new Date(entitlement.tierExpiresAt) : null;
    const isExpired = entitlement.tier === "premium" && expiresAt !== null && expiresAt <= now;
    if (isExpired) {
      res.status(403).json({ code: "forbidden", reason: "entitlement_expired" });
      return;
    }

    if (tierWeight[entitlement.tier] < tierWeight[minimumTier]) {
      res.status(403).json({ code: "forbidden", reason: "tier_insufficient" });
      return;
    }

    next();
  };
}
