-- ─── Skill type ENUM ───
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_type') THEN
    CREATE TYPE skill_type AS ENUM ('frontend', 'backend', 'database', 'cloud_tool');
  END IF;
END
$$;

-- ─── Skills ───
CREATE TABLE IF NOT EXISTS skills (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon        TEXT NOT NULL DEFAULT '⚡',
  name        TEXT NOT NULL,
  type        skill_type NOT NULL DEFAULT 'frontend',
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Projects ───
CREATE TABLE IF NOT EXISTS projects (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji           TEXT NOT NULL DEFAULT '🚀',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  image_url       TEXT,
  link_url        TEXT,
  title_en        TEXT NOT NULL,
  title_vi        TEXT NOT NULL DEFAULT '',
  description_en  TEXT NOT NULL DEFAULT '',
  description_vi  TEXT NOT NULL DEFAULT '',
  sort_order      INT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── Experiences ───
CREATE TABLE IF NOT EXISTS experiences (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_time      TEXT NOT NULL,
  end_time        TEXT,              -- NULL means "Present"
  company         TEXT NOT NULL,
  role_en         TEXT NOT NULL,
  role_vi         TEXT NOT NULL DEFAULT '',
  description_en  TEXT NOT NULL DEFAULT '',
  description_vi  TEXT NOT NULL DEFAULT '',
  sort_order      INT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── Contacts ───
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon        TEXT NOT NULL DEFAULT '🔗',
  label       TEXT NOT NULL,
  href        TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  data_type   TEXT 
);

-- ─── Auto-update updated_at ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security (RLS) ───
-- Enable RLS on all tables
ALTER TABLE skills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts    ENABLE ROW LEVEL SECURITY;

-- Public read access (for portfolio frontend)
CREATE POLICY "Public read skills"
  ON skills FOR SELECT USING (true);

CREATE POLICY "Public read projects"
  ON projects FOR SELECT USING (true);

CREATE POLICY "Public read experiences"
  ON experiences FOR SELECT USING (true);

CREATE POLICY "Public read contacts"
  ON contacts FOR SELECT USING (true);

-- ──────────────────────────────────────────────────
-- Write access — authenticated users only (Supabase Auth).
-- The admin logs in via email/password → gets a session →
-- the anon key is automatically elevated to "authenticated" role.
-- ──────────────────────────────────────────────────
CREATE POLICY "Auth insert skills"
  ON skills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update skills"
  ON skills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete skills"
  ON skills FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert projects"
  ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update projects"
  ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete projects"
  ON projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert experiences"
  ON experiences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update experiences"
  ON experiences FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete experiences"
  ON experiences FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert contacts"
  ON contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update contacts"
  ON contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete contacts"
  ON contacts FOR DELETE TO authenticated USING (true);

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS idx_skills_sort      ON skills      (sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_sort    ON projects    (sort_order);
CREATE INDEX IF NOT EXISTS idx_experiences_sort ON experiences  (sort_order);
CREATE INDEX IF NOT EXISTS idx_contacts_sort    ON contacts     (sort_order);
CREATE INDEX IF NOT EXISTS idx_experiences_start ON experiences (start_time DESC);