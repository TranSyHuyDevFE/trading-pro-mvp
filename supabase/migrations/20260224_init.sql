-- =====================================================
-- TRADING AI PRO MVP - Database Schema
-- Created: 2026-02-24
-- =====================================================

-- Bảng vendors: Lưu thông tin các xưởng đã tìm thấy
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  price_cny DECIMAL(10, 2),
  moq INTEGER DEFAULT 1,
  rating DECIMAL(2, 1) DEFAULT 0,
  years_on_platform INTEGER DEFAULT 0,
  location TEXT,
  image_url TEXT,
  description TEXT,
  search_keyword TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng exchange_rates: Lưu tỷ giá CNY/VND
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL DEFAULT 'CNY',
  to_currency TEXT NOT NULL DEFAULT 'VND',
  rate DECIMAL(12, 4) NOT NULL,
  source TEXT DEFAULT 'api',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng search_history: Lưu lịch sử tìm kiếm
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  user_id UUID,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index để tăng tốc truy vấn
CREATE INDEX IF NOT EXISTS idx_vendors_keyword ON vendors(search_keyword);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched ON exchange_rates(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_date ON search_history(searched_at DESC);

-- Insert tỷ giá mặc định
INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
VALUES ('CNY', 'VND', 3500.0000, 'manual')
ON CONFLICT DO NOTHING;
