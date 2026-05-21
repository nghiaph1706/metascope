CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  order_code BIGINT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
  payment_link_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_firebase_uid
  ON payment_transactions(firebase_uid);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
  ON payment_transactions(status);