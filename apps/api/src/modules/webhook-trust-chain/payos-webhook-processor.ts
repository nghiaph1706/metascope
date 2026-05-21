import type {
  ProcessedWebhookRepository,
  SecurityAuditLogger,
  VerifiedWebhookEvent,
  WebhookAckResponse,
} from "./contracts";

export interface WebhookMutationExecutor {
  /** Runs entitlement mutation + processed mark atomically in one DB transaction. */
  runInTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}

export class PayOSWebhookProcessor {
  public constructor(
    private readonly processedWebhookRepository: ProcessedWebhookRepository,
    private readonly securityAuditLogger: SecurityAuditLogger,
    private readonly mutationExecutor: WebhookMutationExecutor,
  ) {}

  public async processVerifiedEvent(event: VerifiedWebhookEvent): Promise<WebhookAckResponse> {
    // TODO: Check idempotency by eventId and short-circuit duplicate event.
    // TODO: If tx-not-found, emit security/audit event and map to stable ack response.
    // TODO: Run entitlement mutation and markProcessedWithinTransaction in same DB transaction.
    void event;
    throw new Error("TODO: implement PayOSWebhookProcessor.processVerifiedEvent");
  }
}
