import type {
  ProcessedWebhookRepository,
  SecurityAuditLogger,
  VerifiedWebhookEvent,
  WebhookAckResponse,
} from "./contracts";

export interface WebhookMutationExecutor {
  runInTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
  applyEventWithinTransaction?(event: VerifiedWebhookEvent, tx: unknown): Promise<void>;
}

export class PayOSWebhookProcessor {
  public constructor(
    private readonly processedWebhookRepository: ProcessedWebhookRepository,
    private readonly securityAuditLogger: SecurityAuditLogger,
    private readonly mutationExecutor: WebhookMutationExecutor,
  ) {}

  public async processVerifiedEvent(event: VerifiedWebhookEvent): Promise<WebhookAckResponse> {
    const isProcessed = await this.processedWebhookRepository.hasBeenProcessed(
      event.provider,
      event.eventId,
    );
    if (isProcessed) {
      return { code: "00", message: "duplicate" };
    }

    if (!event.transactionId) {
      await this.securityAuditLogger.logTransactionNotFound(event);
      return { code: "00", message: "tx_not_found_audited" };
    }

    await this.mutationExecutor.runInTransaction(async (tx) => {
      if (this.mutationExecutor.applyEventWithinTransaction) {
        await this.mutationExecutor.applyEventWithinTransaction(event, tx);
      }
      await this.processedWebhookRepository.markProcessedWithinTransaction(
        event.provider,
        event.eventId,
        tx,
      );
    });

    return { code: "00", message: "processed" };
  }
}
