import express from "express";
import { Pool } from "pg";
import { createPayOSWebhookRouter } from "./webhooks/payosWebhookExpressAdapter";
import { PayOSWebhookService } from "./webhooks/payosWebhookService";
import { PostgresWebhookDb } from "./webhooks/postgresWebhookDb";

function createWebhookDb(): PostgresWebhookDb {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  return new PostgresWebhookDb(pool);
}

const app = express();
const port = Number(process.env.PORT ?? 4001);
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

if (!checksumKey) {
  throw new Error("PAYOS_CHECKSUM_KEY is required");
}

const webhookService = new PayOSWebhookService(createWebhookDb(), checksumKey);

app.use(
  "/api/v1/webhooks/payos",
  express.raw({ type: "application/json" }),
  createPayOSWebhookRouter(webhookService),
);
app.use(express.json());
app.get("/health", (_req, res) => {
  res.json({ app: "backend", status: "ok" });
});

app.listen(port, () => {
  console.log(`@metascope/backend listening on :${port}`);
});
