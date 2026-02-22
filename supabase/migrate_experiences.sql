-- ═══════════════════════════════════════════════════
--  Migration: experiences.year → start_time + end_time
--  Run this in the Supabase SQL Editor if you already
--  have the experiences table from the old schema.
-- ═══════════════════════════════════════════════════

-- 1. Add new columns
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS end_time   TEXT;

-- 2. Copy existing "year" data into start_time
UPDATE experiences SET start_time = year WHERE start_time IS NULL;

-- 3. Make start_time NOT NULL
ALTER TABLE experiences ALTER COLUMN start_time SET NOT NULL;

-- 4. Drop old year column
ALTER TABLE experiences DROP COLUMN IF EXISTS year;

-- 5. Add index for sorting by start_time
CREATE INDEX IF NOT EXISTS idx_experiences_start ON experiences (start_time DESC);
