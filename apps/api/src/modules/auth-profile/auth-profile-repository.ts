import { AuthProfileRecord, AuthProfileRepository } from "./contracts";

export class InMemoryAuthProfileRepository implements AuthProfileRepository {
  private readonly store = new Map<string, AuthProfileRecord>();

  async upsertByFirebaseUid(input: {
    firebaseUid: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  }): Promise<AuthProfileRecord> {
    const current = this.store.get(input.firebaseUid);

    const next: AuthProfileRecord = {
      firebaseUid: input.firebaseUid,
      email: input.email ?? current?.email,
      displayName: input.displayName ?? current?.displayName,
      avatarUrl: input.avatarUrl ?? current?.avatarUrl,
      tier: current?.tier ?? "basic",
      tierExpiresAt: current?.tierExpiresAt ?? null,
    };

    this.store.set(input.firebaseUid, next);
    return next;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<AuthProfileRecord | null> {
    return this.store.get(firebaseUid) ?? null;
  }
}
