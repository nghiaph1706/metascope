CREATE TABLE IF NOT EXISTS payment_webhook_processed (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider, event_id)
);

CREATE TABLE IF NOT EXISTS payment_webhook_audit_log (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  transaction_id TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_audit_log_provider_event
  ON payment_webhook_audit_log(provider, event_id);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_audit_log_created_at
  ON payment_webhook_audit_log(created_at);