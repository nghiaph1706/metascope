import type { AuthenticatedPrincipal } from "../auth-boundary/contracts";
import {
  AuthProfileRepository,
  AuthProfileServiceContract,
  MeResponseDto,
  SyncProfileRequestDto,
} from "./contracts";

export class AuthProfileService implements AuthProfileServiceContract {
  constructor(private readonly repo: AuthProfileRepository) {}

  async syncProfile(
    principal: AuthenticatedPrincipal,
    payload: SyncProfileRequestDto,
  ): Promise<MeResponseDto> {
    const record = await this.repo.upsertByFirebaseUid({
      firebaseUid: principal.firebaseUid,
      email: principal.email,
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl,
    });

    return this.toMeResponse(record);
  }

  async getMe(principal: AuthenticatedPrincipal): Promise<MeResponseDto> {
    const existing = await this.repo.findByFirebaseUid(principal.firebaseUid);
    if (existing) {
      return this.toMeResponse(existing);
    }

    const created = await this.repo.upsertByFirebaseUid({
      firebaseUid: principal.firebaseUid,
      email: principal.email,
    });

    return this.toMeResponse(created);
  }

  private toMeResponse(record: {
    firebaseUid: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    tier: "basic" | "premium";
    tierExpiresAt: string | null;
  }): MeResponseDto {
    return {
      firebaseUid: record.firebaseUid,
      email: record.email,
      displayName: record.displayName,
      avatarUrl: record.avatarUrl,
      tier: record.tier,
      tierExpiresAt: record.tierExpiresAt,
    };
  }
}
