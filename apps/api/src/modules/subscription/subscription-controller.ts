import type { AuthenticatedRequestLike, HttpResponseLike } from "../auth-boundary/require-auth";
import type { CreatePaymentLinkRequestDto } from "./contracts";
import { SubscriptionService } from "./subscription-service";

export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  postCreatePaymentLink = async (
    req: AuthenticatedRequestLike & { body?: unknown },
    res: HttpResponseLike,
  ): Promise<void> => {
    if (!req.principal) {
      res.status(401).json({ code: "unauthorized" });
      return;
    }

    const payload = this.readPayload(req.body);
    if (!payload) {
      res.status(400).json({ code: "invalid_payload" });
      return;
    }

    try {
      const result = await this.service.createPaymentLink(req.principal, payload);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "order_code_conflict") {
        res.status(409).json({ code: "order_code_conflict" });
        return;
      }

      res.status(502).json({ code: "payment_provider_error" });
    }
  };

  private readPayload(input: unknown): CreatePaymentLinkRequestDto | null {
    if (!input || typeof input !== "object") return null;
    const value = input as Record<string, unknown>;
    if (value.planType !== "premium_monthly") return null;

    return { planType: "premium_monthly" };
  }
}
