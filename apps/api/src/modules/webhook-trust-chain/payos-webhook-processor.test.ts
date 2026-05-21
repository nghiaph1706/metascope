import { describe, expect, it, vi } from "vitest";
import { PayOSWebhookProcessor } from "./payos-webhook-processor";
import type { WebhookMutationExecutor } from "./payos-webhook-processor";
import type {
  ProcessedWebhookRepository,
  SecurityAuditLogger,
  VerifiedWebhookEvent,
} from "./contracts";

const baseEvent: VerifiedWebhookEvent = {
  provider: "payos",
  eventId: "evt_1",
  eventType: "payment.updated",
  transactionId: "1001",
  rawBody: "{}",
  payload: {},
};

describe("PayOSWebhookProcessor", () => {
  it("returns duplicate ack when event already processed", async () => {
    const repository: ProcessedWebhookRepository = {
      hasBeenProcessed: vi.fn().mockResolvedValue(true),
      markProcessedWithinTransaction: vi.fn(),
    };
    const auditLogger: SecurityAuditLogger = {
      logTransactionNotFound: vi.fn(),
    };

    const mutationExecutor = {
      runInTransaction: vi.fn(),
    };

    const processor = new PayOSWebhookProcessor(repository, auditLogger, mutationExecutor);
    const ack = await processor.processVerifiedEvent(baseEvent);

    expect(ack).toMatchObject({ code: "00", message: "duplicate" });
    expect(mutationExecutor.runInTransaction).not.toHaveBeenCalled();
  });

  it("audits and returns ack for tx-not-found", async () => {
    const repository: ProcessedWebhookRepository = {
      hasBeenProcessed: vi.fn().mockResolvedValue(false),
      markProcessedWithinTransaction: vi.fn(),
    };
    const auditLogger: SecurityAuditLogger = {
      logTransactionNotFound: vi.fn().mockResolvedValue(undefined),
    };

    const mutationExecutor = {
      runInTransaction: vi.fn(),
    };

    const processor = new PayOSWebhookProcessor(repository, auditLogger, mutationExecutor);
    const ack = await processor.processVerifiedEvent({ ...baseEvent, transactionId: undefined });

    expect(auditLogger.logTransactionNotFound).toHaveBeenCalledTimes(1);
    expect(ack).toMatchObject({ code: "00", message: "tx_not_found_audited" });
  });

  it("maps tx_not_found error from mutation executor to audited ack", async () => {
    const repository: ProcessedWebhookRepository = {
      hasBeenProcessed: vi.fn().mockResolvedValue(false),
      markProcessedWithinTransaction: vi.fn(),
    };
    const auditLogger: SecurityAuditLogger = {
      logTransactionNotFound: vi.fn().mockResolvedValue(undefined),
    };

    const mutationExecutor: WebhookMutationExecutor = {
      runInTransaction: async () => {
        throw new Error("tx_not_found");
      },
      applyEventWithinTransaction: vi.fn(),
    };

    const processor = new PayOSWebhookProcessor(repository, auditLogger, mutationExecutor);
    const ack = await processor.processVerifiedEvent(baseEvent);

    expect(auditLogger.logTransactionNotFound).toHaveBeenCalledTimes(1);
    expect(ack).toMatchObject({ code: "00", message: "tx_not_found_audited" });
  });

  it("maps user_not_found error from mutation executor to audited ack", async () => {
    const repository: ProcessedWebhookRepository = {
      hasBeenProcessed: vi.fn().mockResolvedValue(false),
      markProcessedWithinTransaction: vi.fn(),
    };
    const auditLogger: SecurityAuditLogger = {
      logTransactionNotFound: vi.fn().mockResolvedValue(undefined),
    };

    const mutationExecutor: WebhookMutationExecutor = {
      runInTransaction: async () => {
        throw new Error("user_not_found");
      },
      applyEventWithinTransaction: vi.fn(),
    };

    const processor = new PayOSWebhookProcessor(repository, auditLogger, mutationExecutor);
    const ack = await processor.processVerifiedEvent(baseEvent);

    expect(auditLogger.logTransactionNotFound).toHaveBeenCalledTimes(1);
    expect(ack).toMatchObject({ code: "00", message: "tx_not_found_audited" });
  });

  it("maps non-paid webhook to ignored ack", async () => {
    const repository: ProcessedWebhookRepository = {
      hasBeenProcessed: vi.fn().mockResolvedValue(false),
      markProcessedWithinTransaction: vi.fn(),
    };
    const auditLogger: SecurityAuditLogger = {
      logTransactionNotFound: vi.fn(),
    };

    const mutationExecutor: WebhookMutationExecutor = {
      runInTransaction: async () => {
        throw new Error("event_not_paid");
      },
      applyEventWithinTransaction: vi.fn(),
    };

    const processor = new PayOSWebhookProcessor(repository, auditLogger, mutationExecutor);
    const ack = await processor.processVerifiedEvent(baseEvent);

    expect(ack).toMatchObject({ code: "00", message: "ignored_not_paid" });
  });

  it("marks processed inside transaction on happy path", async () => {
    const repository: ProcessedWebhookRepository = {
      hasBeenProcessed: vi.fn().mockResolvedValue(false),
      markProcessedWithinTransaction: vi.fn().mockResolvedValue(undefined),
    };
    const auditLogger: SecurityAuditLogger = {
      logTransactionNotFound: vi.fn(),
    };

    const applyEventWithinTransaction = vi.fn().mockResolvedValue(undefined);
    const runInTransaction = vi.fn(async <T>(fn: (tx: unknown) => Promise<T>) => {
      return fn({ tx: "ok" });
    }) as WebhookMutationExecutor["runInTransaction"];
    const mutationExecutor: WebhookMutationExecutor = {
      runInTransaction,
      applyEventWithinTransaction,
    };

    const processor = new PayOSWebhookProcessor(repository, auditLogger, mutationExecutor);
    const ack = await processor.processVerifiedEvent(baseEvent);

    expect(mutationExecutor.runInTransaction).toHaveBeenCalledTimes(1);
    expect(mutationExecutor.applyEventWithinTransaction).toHaveBeenCalledTimes(1);
    expect(repository.markProcessedWithinTransaction).toHaveBeenCalledWith("payos", "evt_1", {
      tx: "ok",
    });
    expect(ack).toMatchObject({ code: "00", message: "processed" });
  });
});
