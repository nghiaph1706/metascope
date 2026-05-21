import type { PaymentTransactionRepository, PendingPaymentTransaction } from "./contracts";

export class InMemoryPaymentTransactionRepository implements PaymentTransactionRepository {
  private readonly orderCodes = new Set<number>();
  private readonly records = new Map<number, PendingPaymentTransaction>();

  async existsByOrderCode(orderCode: number): Promise<boolean> {
    return this.orderCodes.has(orderCode);
  }

  async createPending(tx: PendingPaymentTransaction): Promise<void> {
    this.orderCodes.add(tx.orderCode);
    this.records.set(tx.orderCode, tx);
  }
}
