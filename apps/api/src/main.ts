import express from "express";
import Redis from "ioredis";
import { Pool } from "pg";
import { FirebaseAuthBoundary } from "./modules/auth-boundary/firebase-auth-boundary";
import { requireAuth } from "./modules/auth-boundary/require-auth";
import { AuthProfileController } from "./modules/auth-profile/auth-profile-controller";
import { InMemoryAuthProfileRepository } from "./modules/auth-profile/auth-profile-repository";
import { AuthProfileService } from "./modules/auth-profile/auth-profile-service";
import {
  InMemoryEntitlementReader,
  PostgresEntitlementReader,
  requireEntitlement,
} from "./modules/entitlement-guard";
import { enforceQuota, InMemoryQuotaStore, RedisQuotaStore } from "./modules/quota-guard";
import {
  InMemoryPaymentTransactionRepository,
  PostgresPaymentTransactionRepository,
  StubPayOSPaymentLinkClient,
  SubscriptionController,
  SubscriptionService,
} from "./modules/subscription";
import {
  PayOSSignatureVerifier,
  PayOSWebhookController,
  PayOSWebhookProcessor,
  PostgresProcessedWebhookRepository,
  PostgresSecurityAuditLogger,
  PostgresWebhookMutationExecutor,
} from "./modules/webhook-trust-chain";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const isTest = process.env.NODE_ENV === "test";
const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

if (!isTest && !databaseUrl) {
  throw new Error("DATABASE_URL is required");
}
if (!isTest && !redisUrl) {
  throw new Error("REDIS_URL is required");
}

const postgresPool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

const authBoundary = new FirebaseAuthBoundary();
const authProfileRepository = new InMemoryAuthProfileRepository();
const authProfileService = new AuthProfileService(authProfileRepository);
const authProfileController = new AuthProfileController(authProfileService);

const paymentTransactionRepository =
  !isTest && postgresPool
    ? new PostgresPaymentTransactionRepository(postgresPool)
    : new InMemoryPaymentTransactionRepository();
const subscriptionService = new SubscriptionService(
  new StubPayOSPaymentLinkClient(),
  paymentTransactionRepository,
  {
    returnUrl: process.env.PAYOS_RETURN_URL ?? "https://example.com/payment/success",
    cancelUrl: process.env.PAYOS_CANCEL_URL ?? "https://example.com/payment/cancel",
    expirySeconds: 15 * 60,
  },
);
const subscriptionController = new SubscriptionController(subscriptionService);

class InMemoryProcessedWebhookRepository {
  private readonly processed = new Set<string>();

  public async markProcessedWithinTransaction(provider: "payos", eventId: string): Promise<void> {
    this.processed.add(`${provider}:${eventId}`);
  }

  public async hasBeenProcessed(provider: "payos", eventId: string): Promise<boolean> {
    return this.processed.has(`${provider}:${eventId}`);
  }
}

class ConsoleSecurityAuditLogger {
  public async logTransactionNotFound(event: {
    provider: "payos";
    eventId: string;
    transactionId?: string;
  }): Promise<void> {
    console.warn("[payos-webhook] tx-not-found", {
      provider: event.provider,
      eventId: event.eventId,
      transactionId: event.transactionId,
    });
  }
}

class NoopWebhookMutationExecutor {
  public async runInTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return fn({});
  }

  public async applyEventWithinTransaction(event: {
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const status = String(
      event.payload.status ??
        (event.payload.data as Record<string, unknown> | undefined)?.status ??
        "",
    ).toUpperCase();
    if (event.eventType.toLowerCase() !== "payment.updated" || status !== "PAID") {
      throw new Error("event_not_paid");
    }
  }
}

const processedWebhookRepository =
  !isTest && postgresPool
    ? new PostgresProcessedWebhookRepository(postgresPool)
    : new InMemoryProcessedWebhookRepository();
const securityAuditLogger =
  !isTest && postgresPool
    ? new PostgresSecurityAuditLogger(postgresPool)
    : new ConsoleSecurityAuditLogger();
const webhookMutationExecutor =
  !isTest &&
  postgresPool &&
  paymentTransactionRepository instanceof PostgresPaymentTransactionRepository
    ? new PostgresWebhookMutationExecutor(postgresPool, paymentTransactionRepository)
    : new NoopWebhookMutationExecutor();

const webhookController = new PayOSWebhookController(
  new PayOSSignatureVerifier(),
  new PayOSWebhookProcessor(
    processedWebhookRepository,
    securityAuditLogger,
    webhookMutationExecutor,
  ),
);

const testEntitlementReader = new InMemoryEntitlementReader();
const entitlementReader =
  !isTest && postgresPool ? new PostgresEntitlementReader(postgresPool) : testEntitlementReader;

const quotaStore =
  !isTest && redisUrl ? new RedisQuotaStore(new Redis(redisUrl)) : new InMemoryQuotaStore();
const entitlementEditor = isTest ? testEntitlementReader : null;

app.use(
  "/api/v1/payment/webhook/payos",
  express.raw({ type: "application/json" }),
  (req, _res, next) => {
    const mutableReq = req as typeof req & { rawBody?: string };
    mutableReq.rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(mutableReq.rawBody) as unknown;
      } catch {
        req.body = {};
      }
    }
    next();
  },
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ app: "api", status: "ok" });
});

app.post(
  "/api/v1/auth/sync-profile",
  requireAuth(authBoundary),
  authProfileController.postSyncProfile,
);
app.get("/api/v1/auth/me", requireAuth(authBoundary), authProfileController.getMe);

app.post(
  "/api/v1/subscription/create-payment-link",
  requireAuth(authBoundary),
  subscriptionController.postCreatePaymentLink,
);

app.post("/api/v1/payment/webhook/payos", webhookController.handleWebhook.bind(webhookController));

app.get(
  "/api/v1/tools/premium-demo",
  requireAuth(authBoundary),
  requireEntitlement(entitlementReader, "premium"),
  enforceQuota(quotaStore, "premium_demo", { limit: 5, windowSeconds: 60 }),
  (_req, res) => {
    res.status(200).json({ ok: true, feature: "premium_demo" });
  },
);

if (!isTest) {
  app.listen(port, () => {
    console.log(`@metascope/api listening on :${port}`);
  });
}

export { app, entitlementEditor, quotaStore };
