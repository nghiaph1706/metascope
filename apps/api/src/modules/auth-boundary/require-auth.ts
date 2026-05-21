import type { AuthBoundary, AuthenticatedPrincipal } from "./contracts";

export interface HttpRequestLike {
  headers: Record<string, string | string[] | undefined>;
}

export interface HttpResponseLike {
  status(code: number): this;
  json(payload: unknown): this;
}

export interface NextFunctionLike {
  (error?: unknown): void;
}

export interface AuthenticatedRequestLike extends HttpRequestLike {
  principal?: AuthenticatedPrincipal;
}

/**
 * Middleware boundary for protected endpoints.
 * Contract: attaches canonical firebaseUid principal to request when auth succeeds.
 */
export function requireAuth(authBoundary: AuthBoundary) {
  return async (
    req: AuthenticatedRequestLike,
    res: HttpResponseLike,
    next: NextFunctionLike,
  ): Promise<void> => {
    // TODO: Parse bearer token, authenticate via authBoundary, attach req.principal.
    // TODO: Return standardized unauthorized response on auth failure.
    void authBoundary;
    void req;
    void res;
    void next;
    throw new Error("TODO: implement requireAuth middleware");
  };
}
