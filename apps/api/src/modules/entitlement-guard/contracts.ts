export type EntitlementTier = "basic" | "premium";

export interface EntitlementRecord {
  firebaseUid: string;
  tier: EntitlementTier;
  tierExpiresAt: string | null;
}

export interface EntitlementReader {
  getEntitlementByFirebaseUid(firebaseUid: string): Promise<EntitlementRecord | null>;
}
