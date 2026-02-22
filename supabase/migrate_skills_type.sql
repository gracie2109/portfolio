-- ─── Add skill_type ENUM and type column to skills ───

-- 1. Create the ENUM type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_type') THEN
    CREATE TYPE skill_type AS ENUM ('frontend', 'backend', 'database', 'cloud_tool');
  END IF;
END
$$;

-- 2. Add the "type" column (default = 'frontend')
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS type skill_type NOT NULL DEFAULT 'frontend';

-- 3. (Optional) Back-fill existing rows — adjust names to match your data
-- UPDATE skills SET type = 'backend'    WHERE name ILIKE ANY(ARRAY['%node%','%nest%','%express%']);
-- UPDATE skills SET type = 'database'   WHERE name ILIKE ANY(ARRAY['%sql%','%postgres%','%mongo%','%redis%']);
-- UPDATE skills SET type = 'cloud_tool' WHERE name ILIKE ANY(ARRAY['%docker%','%aws%','%figma%','%git%','%vercel%','%firebase%','%supabase%']);
