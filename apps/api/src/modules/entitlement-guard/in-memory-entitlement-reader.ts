import type { EntitlementReader, EntitlementRecord } from "./contracts";

export class InMemoryEntitlementReader implements EntitlementReader {
  private readonly store = new Map<string, EntitlementRecord>();

  async getEntitlementByFirebaseUid(firebaseUid: string): Promise<EntitlementRecord | null> {
    return this.store.get(firebaseUid) ?? null;
  }

  setEntitlement(record: EntitlementRecord): void {
    this.store.set(record.firebaseUid, record);
  }
}
