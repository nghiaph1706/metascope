import { Pool } from "pg";
import type { EntitlementReader, EntitlementRecord } from "./contracts";

export class PostgresEntitlementReader implements EntitlementReader {
  constructor(private readonly pool: Pool) {}

  async getEntitlementByFirebaseUid(firebaseUid: string): Promise<EntitlementRecord | null> {
    const result = await this.pool.query(
      `select firebase_uid, tier, tier_expires_at from users where firebase_uid = $1 limit 1`,
      [firebaseUid],
    );

    if (!result.rowCount) return null;

    const row = result.rows[0] as {
      firebase_uid: string;
      tier: "basic" | "premium";
      tier_expires_at: string | null;
    };

    return {
      firebaseUid: row.firebase_uid,
      tier: row.tier,
      tierExpiresAt: row.tier_expires_at,
    };
  }
}
