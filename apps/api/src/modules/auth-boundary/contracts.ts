export interface AuthenticatedPrincipal {
  /** Canonical identity from Firebase token subject. */
  firebaseUid: string;
  /** Optional email claim for downstream read-only usage. */
  email?: string;
}

export interface AuthTokenPayload {
  sub: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthBoundary {
  /**
   * Validates auth token and returns canonical principal.
   * Must enforce Firebase UID (`sub`) as source-of-truth identity.
   */
  authenticateBearerToken(token: string): Promise<AuthenticatedPrincipal>;
}
