import crypto from "node:crypto";
import type { VerifiedWebhookEvent, WebhookSignatureVerifier } from "./contracts";

export class PayOSSignatureVerifier implements WebhookSignatureVerifier {
  public constructor(private readonly webhookSecret: string) {}

  public async verify(
    rawBody: string,
    signatureHeader: string | undefined,
  ): Promise<VerifiedWebhookEvent> {
    if (!signatureHeader || signatureHeader.trim().length === 0) {
      throw new Error("invalid_signature");
    }

    if (!rawBody || rawBody.trim().length === 0) {
      throw new Error("invalid_payload");
    }

    if (!this.webhookSecret || this.webhookSecret.trim().length === 0) {
      throw new Error("invalid_signature");
    }

    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody, "utf8")
      .digest("hex");
    const normalizedSignature = signatureHeader.trim().toLowerCase();
    if (normalizedSignature.length !== expected.length) {
      throw new Error("invalid_signature");
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(normalizedSignature, "utf8"),
      Buffer.from(expected, "utf8"),
    );

    if (!isValid) {
      throw new Error("invalid_signature");
    }

    const parsed = JSON.parse(rawBody) as Record<string, unknown>;
    const data = (parsed.data as Record<string, unknown> | undefined) ?? parsed;

    const eventId =
      this.readString(parsed, "id") ??
      this.readString(parsed, "eventId") ??
      this.readString(data, "orderCode") ??
      this.readString(data, "paymentLinkId");
    const eventType =
      this.readString(parsed, "eventType") ?? this.readString(parsed, "type") ?? "payment.updated";
    const transactionId =
      this.readString(data, "orderCode") ?? this.readString(data, "transactionId");

    if (!eventId) {
      throw new Error("invalid_payload");
    }

    return {
      provider: "payos",
      eventId,
      eventType,
      transactionId,
      rawBody,
      payload: parsed,
    };
  }

  private readString(input: Record<string, unknown>, key: string): string | undefined {
    const value = input[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    return undefined;
  }
}
