import { Request, Response, Router } from "express";
import { PayOSWebhookService } from "./payosWebhookService";
import { PayOSWebhookPayload } from "./types";

function isValidPayload(payload: unknown): payload is PayOSWebhookPayload {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  if (typeof value.event_id !== "string") return false;
  if (typeof value.code !== "string") return false;
  if (typeof value.success !== "boolean") return false;
  if (!value.data || typeof value.data !== "object") return false;

  const data = value.data as Record<string, unknown>;
  if (typeof data.orderCode !== "number") return false;
  if (data.amount !== undefined && typeof data.amount !== "number") return false;
  if (data.transactionDateTime !== undefined && typeof data.transactionDateTime !== "string")
    return false;

  return true;
}

export function createPayOSWebhookRouter(service: PayOSWebhookService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    if (!Buffer.isBuffer(req.body)) {
      res.status(200).json({ code: "01", desc: "invalid payload" });
      return;
    }

    const rawBody = req.body;

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      res.status(200).json({ code: "01", desc: "invalid payload" });
      return;
    }

    if (!isValidPayload(parsedPayload)) {
      res.status(200).json({ code: "01", desc: "invalid payload" });
      return;
    }

    const payload = parsedPayload;

    const signatureHeader = String(req.header("x-payos-signature") ?? "");
    if (!signatureHeader) {
      res.status(200).json({ code: "01", desc: "invalid signature" });
      return;
    }

    try {
      const result = await service.handleWebhook(payload, rawBody, signatureHeader);
      res.status(200).json(result);
    } catch {
      res.status(200).json({ code: "02", desc: "transient internal failure", retry_after: 15 });
    }
  });

  return router;
}
