import type { AuthenticatedRequestLike, HttpResponseLike } from "../auth-boundary/require-auth";
import type { AuthProfileServiceContract, SyncProfileRequestDto } from "./contracts";

export class AuthProfileController {
  constructor(private readonly service: AuthProfileServiceContract) {}

  postSyncProfile = async (
    req: AuthenticatedRequestLike & { body?: unknown },
    res: HttpResponseLike,
  ): Promise<void> => {
    if (!req.principal) {
      res.status(401).json({ code: "unauthorized" });
      return;
    }

    const payload = this.readSyncPayload(req.body);
    if (!payload) {
      res.status(400).json({ code: "invalid_payload" });
      return;
    }

    const me = await this.service.syncProfile(req.principal, payload);
    res.status(200).json(me);
  };

  getMe = async (req: AuthenticatedRequestLike, res: HttpResponseLike): Promise<void> => {
    if (!req.principal) {
      res.status(401).json({ code: "unauthorized" });
      return;
    }

    const me = await this.service.getMe(req.principal);
    res.status(200).json(me);
  };

  private readSyncPayload(body: unknown): SyncProfileRequestDto | null {
    if (!body || typeof body !== "object") {
      return {};
    }

    const value = body as Record<string, unknown>;
    if (value.displayName !== undefined && typeof value.displayName !== "string") {
      return null;
    }
    if (value.avatarUrl !== undefined && typeof value.avatarUrl !== "string") {
      return null;
    }

    return {
      displayName: value.displayName as string | undefined,
      avatarUrl: value.avatarUrl as string | undefined,
    };
  }
}
