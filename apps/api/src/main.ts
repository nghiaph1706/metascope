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
  StubPayOSPaymentLinkClient,
  SubscriptionController,
  SubscriptionService,
} from "./modules/subscription";

const app = express();
const port = Number(process.env.PORT ?? 4000);

const authBoundary = new FirebaseAuthBoundary();
const authProfileRepository = new InMemoryAuthProfileRepository();
const authProfileService = new AuthProfileService(authProfileRepository);
const authProfileController = new AuthProfileController(authProfileService);

const paymentTransactionRepository = new InMemoryPaymentTransactionRepository();
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

const isTest = process.env.NODE_ENV === "test";
const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

if (!isTest && !databaseUrl) {
  throw new Error("DATABASE_URL is required");
}
if (!isTest && !redisUrl) {
  throw new Error("REDIS_URL is required");
}

const testEntitlementReader = new InMemoryEntitlementReader();
const entitlementReader =
  !isTest && databaseUrl
    ? new PostgresEntitlementReader(new Pool({ connectionString: databaseUrl }))
    : testEntitlementReader;

const quotaStore =
  !isTest && redisUrl ? new RedisQuotaStore(new Redis(redisUrl)) : new InMemoryQuotaStore();

const entitlementEditor = isTest ? testEntitlementReader : null;

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

app.get(
  "/api/v1/tools/premium-demo",
  requireAuth(authBoundary),
  requireEntitlement(entitlementReader, "premium"),
  enforceQuota(quotaStore, "premium_demo", { limit: 5, windowSeconds: 60 }),
  (_req, res) => {
    res.status(200).json({ ok: true, feature: "premium_demo" });
  },
);

app.listen(port, () => {
  console.log(`@metascope/api listening on :${port}`);
});

export { app, entitlementEditor, quotaStore };
