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
    const authHeader = req.headers.authorization;
    const rawValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    if (!rawValue || !rawValue.startsWith("Bearer ")) {
      res.status(401).json({ code: "unauthorized" });
      return;
    }

    const token = rawValue.slice("Bearer ".length).trim();
    if (!token) {
      res.status(401).json({ code: "unauthorized" });
      return;
    }

    try {
      const principal = await authBoundary.authenticateBearerToken(token);
      req.principal = principal;
      next();
    } catch {
      res.status(401).json({ code: "unauthorized" });
    }
  };
}
