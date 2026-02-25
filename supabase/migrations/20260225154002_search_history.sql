-- ============================================================
-- Migration: 002_search_history.sql
-- Cache kết quả AI theo keyword — tránh gọi lại AI tốn tiền
-- ============================================================

-- Xóa bảng cũ để cập nhật schema (JSONB results)
DROP TABLE IF EXISTS search_history CASCADE;

CREATE TABLE search_history (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword      TEXT        NOT NULL,   -- keyword đã normalize (lowercase + trim) — dùng để lookup cache
  region       TEXT        NOT NULL DEFAULT 'VN',  -- 'VN' | 'CN' | 'KH' | 'ALL'
  results_json JSONB       NULL,       -- Array kết quả AI trả về [{name, price, currency, moq, ...}]
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Cache control
  expires_at   TIMESTAMPTZ NULL,       -- NULL = không hết hạn. Có giá trị = sẽ bị bỏ qua và gọi AI lại
  hit_count    INTEGER     DEFAULT 1,  -- Số lần keyword này được search — phân tích xu hướng

  -- Mỗi cặp (keyword + region) chỉ có 1 record
  CONSTRAINT search_history_keyword_region_key UNIQUE (keyword, region)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_search_history_keyword   ON search_history (keyword);
CREATE INDEX IF NOT EXISTS idx_search_history_region    ON search_history (region);
CREATE INDEX IF NOT EXISTS idx_search_history_created   ON search_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_expires   ON search_history (expires_at)
  WHERE expires_at IS NOT NULL;

-- ★ Function: Upsert + tăng hit_count mỗi lần search
-- App gọi hàm này thay vì INSERT trực tiếp
CREATE OR REPLACE FUNCTION upsert_search(
  p_keyword      TEXT,
  p_region       TEXT      DEFAULT 'VN',
  p_results_json JSONB     DEFAULT NULL,
  p_cache_hours  INTEGER   DEFAULT 24    -- Cache 24 giờ. Set 0 = không cache
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO search_history (keyword, region, results_json, expires_at, hit_count)
  VALUES (
    LOWER(TRIM(p_keyword)),
    p_region,
    p_results_json,
    CASE WHEN p_cache_hours > 0
      THEN NOW() + (p_cache_hours || ' hours')::INTERVAL
      ELSE NULL END,
    1
  )
  ON CONFLICT (keyword, region) DO UPDATE SET
    results_json = COALESCE(EXCLUDED.results_json, search_history.results_json),
    expires_at   = EXCLUDED.expires_at,
    hit_count    = search_history.hit_count + 1
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ★ Function: Lấy cache còn hạn
-- App gọi trước khi gọi AI; nếu có data thì dùng luôn
CREATE OR REPLACE FUNCTION get_search_cache(
  p_keyword TEXT,
  p_region  TEXT DEFAULT 'VN'
)
RETURNS TABLE (id UUID, results_json JSONB, hit_count INTEGER)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT sh.id, sh.results_json, sh.hit_count
  FROM   search_history sh
  WHERE  sh.keyword      = LOWER(TRIM(p_keyword))
    AND  sh.region       = p_region
    AND  sh.results_json IS NOT NULL
    AND  (sh.expires_at IS NULL OR sh.expires_at > NOW())
  LIMIT 1;
END;
$$;

-- ★ RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- App (anon key) được đọc và ghi — cần để cache hoạt động không cần login
CREATE POLICY "search_history_read"
  ON search_history FOR SELECT USING (true);

CREATE POLICY "search_history_insert"
  ON search_history FOR INSERT WITH CHECK (true);

CREATE POLICY "search_history_update"
  ON search_history FOR UPDATE USING (true) WITH CHECK (true);

-- Chỉ service_role xóa được (bảo vệ dữ liệu cache)
CREATE POLICY "search_history_delete_service"
  ON search_history FOR DELETE
  USING (auth.role() = 'service_role');

-- ★ View tiện lợi: Top keywords được search nhiều nhất
CREATE OR REPLACE VIEW top_keywords AS
SELECT
  keyword,
  region,
  hit_count,
  created_at,
  CASE
    WHEN expires_at IS NULL THEN 'permanent'
    WHEN expires_at > NOW() THEN 'valid'
    ELSE 'expired'
  END AS cache_status
FROM search_history
ORDER BY hit_count DESC
LIMIT 50;
