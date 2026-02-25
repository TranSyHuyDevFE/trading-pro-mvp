-- ============================================================
-- Migration: 001_exchange_rates.sql
-- Bảng tỷ giá hối đoái — tự động cập nhật mỗi giờ qua Edge Function
-- ============================================================

-- Xóa bảng cũ để đảm bảo schema mới nhất (vì đây là giai đoạn setup)
DROP TABLE IF EXISTS exchange_rates CASCADE;

CREATE TABLE exchange_rates (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  pair       TEXT        NOT NULL,             -- 'CNY/VND' | 'USD/VND' | 'KHR/VND'
  rate       FLOAT8      NOT NULL,             -- 1 CNY = 3520 VND  →  rate = 3520
  provider   TEXT        NOT NULL DEFAULT 'manual',  -- nguồn: manual | vietcombank | open-exchange
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT exchange_rates_pair_key UNIQUE (pair)
);

-- Auto-update updated_at khi record thay đổi
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_exchange_rates_touch
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Index tăng tốc lookup theo pair
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates (pair);

-- Seed: dữ liệu mặc định khi mới deploy
INSERT INTO exchange_rates (pair, rate, provider) VALUES
  ('CNY/VND', 3520,    'manual'),
  ('USD/VND', 25400,   'manual'),
  ('KHR/VND', 6.2,     'manual'),
  ('VND/VND', 1,       'manual')
ON CONFLICT (pair) DO UPDATE
  SET rate     = EXCLUDED.rate,
      provider = EXCLUDED.provider,
      updated_at = NOW();

-- ★ RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Mọi người đọc được (tỷ giá là public info)
CREATE POLICY "exchange_rates_public_read"
  ON exchange_rates FOR SELECT USING (true);

-- Chỉ service_role được ghi (Edge Function dùng service key)
CREATE POLICY "exchange_rates_service_write"
  ON exchange_rates FOR ALL
  USING     (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
