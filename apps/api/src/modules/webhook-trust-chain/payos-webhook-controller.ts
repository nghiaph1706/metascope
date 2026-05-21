import type { HttpRequestLike, HttpResponseLike } from "../auth-boundary/require-auth";
import type { WebhookAckResponse, WebhookSignatureVerifier } from "./contracts";
import { PayOSWebhookProcessor } from "./payos-webhook-processor";

export class PayOSWebhookController {
  public constructor(
    private readonly signatureVerifier: WebhookSignatureVerifier,
    private readonly webhookProcessor: PayOSWebhookProcessor,
  ) {}

  /**
   * Contract: always returns HTTP 200 for invalid signature with ack code=01.
   */
  public async handleWebhook(
    req: HttpRequestLike & { rawBody?: string },
    res: HttpResponseLike,
  ): Promise<void> {
    // TODO: Read signature header + raw body.
    // TODO: On invalid signature, respond HTTP 200 with { code: '01', message: ... }.
    // TODO: On verified event, delegate to processor and return stable ack payload.
    void req;
    void res;
    throw new Error("TODO: implement PayOSWebhookController.handleWebhook");
  }

  protected sendAck(res: HttpResponseLike, ack: WebhookAckResponse): void {
    // TODO: Normalize ack response transport. Keep retry_after in seconds when present.
    void res;
    void ack;
    throw new Error("TODO: implement PayOSWebhookController.sendAck");
  }
}
