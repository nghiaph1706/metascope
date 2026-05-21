import type {
  PaymentLinkProvider,
  PaymentLinkProviderRequest,
  PaymentLinkProviderResponse,
} from "./contracts";

export class StubPayOSPaymentLinkClient implements PaymentLinkProvider {
  async createPaymentLink(input: PaymentLinkProviderRequest): Promise<PaymentLinkProviderResponse> {
    return {
      checkoutUrl: `https://pay.example/checkout/${input.orderCode}`,
      paymentLinkId: `plink_${input.orderCode}`,
    };
  }
}
