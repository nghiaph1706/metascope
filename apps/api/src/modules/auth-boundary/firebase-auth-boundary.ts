import { AuthBoundary, AuthenticatedPrincipal, AuthTokenPayload } from "./contracts";

export class FirebaseAuthBoundary implements AuthBoundary {
  public async authenticateBearerToken(token: string): Promise<AuthenticatedPrincipal> {
    if (!token) {
      throw new Error("unauthorized");
    }

    const payload = this.decodeBearerToken(token);
    return this.mapPayloadToPrincipal(payload);
  }

  protected mapPayloadToPrincipal(payload: AuthTokenPayload): AuthenticatedPrincipal {
    if (!payload?.sub) {
      throw new Error("unauthorized");
    }

    return {
      firebaseUid: payload.sub,
      email: payload.email,
    };
  }

  private decodeBearerToken(token: string): AuthTokenPayload {
    const parts = token.split(".");
    if (parts.length < 2) {
      throw new Error("unauthorized");
    }

    try {
      const encodedPayload = parts[1];
      const jsonPayload = Buffer.from(encodedPayload, "base64url").toString("utf8");
      return JSON.parse(jsonPayload) as AuthTokenPayload;
    } catch {
      throw new Error("unauthorized");
    }
  }
}
