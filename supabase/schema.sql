-- ============================================================
-- Hello Madhesh – Supabase SQL Setup
-- Run each block in Supabase → SQL Editor (in this order)
-- ============================================================


-- ── STEP 1: Create the reports table ──────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name          TEXT        NOT NULL,
    phone         TEXT,
    district      TEXT        NOT NULL,
    municipality  TEXT        NOT NULL,
    ward          TEXT,
    category      TEXT        NOT NULL,
    description   TEXT        NOT NULL,
    photo_url     TEXT,
    latitude      NUMERIC,
    longitude     NUMERIC,
    status        TEXT        DEFAULT 'Pending',
    created_at    TIMESTAMPTZ DEFAULT now()
);


-- ── STEP 2: Enable Row Level Security ─────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;


-- ── STEP 3: Public read policy (anyone can view reports) ───────
CREATE POLICY "Public can read reports"
    ON reports FOR SELECT
    USING (true);


-- ── STEP 4: Public insert policy (anyone can submit a report) ──
CREATE POLICY "Public can insert reports"
    ON reports FOR INSERT
    WITH CHECK (true);


-- ── STEP 5: Storage bucket policies ───────────────────────────
-- NOTE: First create the bucket via Supabase UI:
--   Storage → New Bucket → name: report-images → ✅ Public bucket
-- Then run these policies:

CREATE POLICY "Public can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Public can read images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'report-images');
