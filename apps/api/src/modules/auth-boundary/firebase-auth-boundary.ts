import { AuthBoundary, AuthenticatedPrincipal, AuthTokenPayload } from "./contracts";

export class FirebaseAuthBoundary implements AuthBoundary {
  public async authenticateBearerToken(token: string): Promise<AuthenticatedPrincipal> {
    // TODO: Verify Firebase ID token signature and claims using Admin SDK/JWKS.
    // TODO: Map verified token payload to AuthenticatedPrincipal with firebaseUid=payload.sub.
    void token;
    throw new Error("TODO: implement FirebaseAuthBoundary.authenticateBearerToken");
  }

  protected mapPayloadToPrincipal(payload: AuthTokenPayload): AuthenticatedPrincipal {
    // TODO: Validate required claims and return canonical principal.
    void payload;
    throw new Error("TODO: implement FirebaseAuthBoundary.mapPayloadToPrincipal");
  }
}
