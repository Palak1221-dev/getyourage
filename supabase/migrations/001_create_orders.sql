-- Migration: Create orders table for digital planner store
-- Replaces file-based /tmp/orders.json with PostgreSQL

CREATE TABLE IF NOT EXISTS orders (
  id                        TEXT PRIMARY KEY,
  dodo_checkout_session_id  TEXT NOT NULL,
  dodo_payment_id           TEXT,
  customer_email            TEXT NOT NULL,
  customer_name             TEXT NOT NULL DEFAULT '',
  amount                    DOUBLE PRECISION NOT NULL,
  currency                  TEXT NOT NULL DEFAULT 'USD',
  status                    TEXT NOT NULL DEFAULT 'pending',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  license_key               TEXT,
  download_url              TEXT,
  items                     JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Indexes for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_dodo_checkout_session_id ON orders (dodo_checkout_session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_dodo_payment_id ON orders (dodo_payment_id) WHERE dodo_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_status_updated ON orders (status, updated_at DESC);
