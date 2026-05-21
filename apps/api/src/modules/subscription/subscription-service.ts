import type { AuthenticatedPrincipal } from "../auth-boundary/contracts";
import {
  CreatePaymentLinkConfig,
  CreatePaymentLinkRequestDto,
  CreatePaymentLinkResponseDto,
  PaymentLinkProvider,
  PaymentTransactionRepository,
  SubscriptionPlanType,
} from "./contracts";

const PLAN_AMOUNT: Record<SubscriptionPlanType, number> = {
  premium_monthly: 99000,
};

const MAX_DESCRIPTION_LENGTH = 25;

export class SubscriptionService {
  constructor(
    private readonly paymentProvider: PaymentLinkProvider,
    private readonly transactionRepo: PaymentTransactionRepository,
    private readonly config: CreatePaymentLinkConfig,
  ) {}

  async createPaymentLink(
    principal: AuthenticatedPrincipal,
    request: CreatePaymentLinkRequestDto,
  ): Promise<CreatePaymentLinkResponseDto> {
    const amount = PLAN_AMOUNT[request.planType];
    const orderCode = await this.generateUniqueOrderCode();
    const now = Date.now();
    const expiresAtMs = now + this.config.expirySeconds * 1000;
    const expiresAtIso = new Date(expiresAtMs).toISOString();

    const description = `MS-${orderCode}`;
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error("invalid_description");
    }

    const providerResponse = await this.paymentProvider.createPaymentLink({
      orderCode,
      amount,
      description,
      returnUrl: this.config.returnUrl,
      cancelUrl: this.config.cancelUrl,
      expiredAtUnix: Math.floor(expiresAtMs / 1000),
    });

    await this.transactionRepo.createPending({
      firebaseUid: principal.firebaseUid,
      orderCode,
      amount,
      planType: request.planType,
      status: "pending",
      paymentLinkId: providerResponse.paymentLinkId,
      expiresAt: expiresAtIso,
    });

    return {
      checkoutUrl: providerResponse.checkoutUrl,
      orderCode,
      amount,
      expiresAt: expiresAtIso,
      paymentLinkId: providerResponse.paymentLinkId,
    };
  }

  private async generateUniqueOrderCode(): Promise<number> {
    for (let i = 0; i < 5; i += 1) {
      const candidate = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
      if (Number.isSafeInteger(candidate) && candidate > 0) {
        const exists = await this.transactionRepo.existsByOrderCode(candidate);
        if (!exists) {
          return candidate;
        }
      }
    }

    throw new Error("order_code_conflict");
  }
}
