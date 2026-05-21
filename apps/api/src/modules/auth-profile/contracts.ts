import type { AuthenticatedPrincipal } from "../auth-boundary/contracts";

export interface SyncProfileRequestDto {
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthProfileRecord {
  firebaseUid: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  tier: "basic" | "premium";
  tierExpiresAt: string | null;
}

export interface MeResponseDto {
  firebaseUid: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  tier: "basic" | "premium";
  tierExpiresAt: string | null;
}

export interface AuthProfileRepository {
  upsertByFirebaseUid(input: {
    firebaseUid: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  }): Promise<AuthProfileRecord>;
  findByFirebaseUid(firebaseUid: string): Promise<AuthProfileRecord | null>;
}

export interface AuthProfileServiceContract {
  syncProfile(
    principal: AuthenticatedPrincipal,
    payload: SyncProfileRequestDto,
  ): Promise<MeResponseDto>;
  getMe(principal: AuthenticatedPrincipal): Promise<MeResponseDto>;
}
