import type { HttpRequestLike, HttpResponseLike } from "../auth-boundary/require-auth";
import type { WebhookAckResponse, WebhookSignatureVerifier } from "./contracts";
import { PayOSWebhookProcessor } from "./payos-webhook-processor";

export class PayOSWebhookController {
  public constructor(
    private readonly signatureVerifier: WebhookSignatureVerifier,
    private readonly webhookProcessor: PayOSWebhookProcessor,
  ) {}

  public async handleWebhook(
    req: HttpRequestLike & { rawBody?: string; body?: unknown },
    res: HttpResponseLike,
  ): Promise<void> {
    try {
      const signatureHeader = this.readHeader(req.headers, "x-payos-signature");
      const rawBody = req.rawBody ?? JSON.stringify(req.body ?? {});
      const verifiedEvent = await this.signatureVerifier.verify(rawBody, signatureHeader);
      const ack = await this.webhookProcessor.processVerifiedEvent(verifiedEvent);
      this.sendAck(res, ack);
      return;
    } catch (error) {
      if (error instanceof Error && error.message === "invalid_signature") {
        this.sendAck(res, { code: "01", message: "invalid_signature" });
        return;
      }
      this.sendAck(res, { code: "02", message: "accepted_not_applied", retry_after: 30 });
    }
  }

  protected sendAck(res: HttpResponseLike, ack: WebhookAckResponse): void {
    const payload: WebhookAckResponse = {
      code: ack.code,
      message: ack.message,
    };

    if (typeof ack.retry_after === "number") {
      payload.retry_after = ack.retry_after;
    }

    res.status(200).json(payload);
  }

  private readHeader(
    headers: Record<string, string | string[] | undefined>,
    key: string,
  ): string | undefined {
    const value = headers[key] ?? headers[key.toLowerCase()];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }
}
