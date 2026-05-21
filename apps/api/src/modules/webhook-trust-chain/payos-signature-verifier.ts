import type { VerifiedWebhookEvent, WebhookSignatureVerifier } from "./contracts";

export class PayOSSignatureVerifier implements WebhookSignatureVerifier {
  public async verify(
    rawBody: string,
    signatureHeader: string | undefined,
  ): Promise<VerifiedWebhookEvent> {
    // TODO: Validate webhook signature against configured PayOS secret.
    // TODO: Parse and normalize payload into VerifiedWebhookEvent.
    void rawBody;
    void signatureHeader;
    throw new Error("TODO: implement PayOSSignatureVerifier.verify");
  }
}
