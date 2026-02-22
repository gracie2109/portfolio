-- ═══════════════════════════════════════════════════
--  Migration: Add contacts table
--  Run this in the Supabase SQL Editor if you already
--  have the other tables but not contacts.
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contacts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon        TEXT NOT NULL DEFAULT '🔗',
  label       TEXT NOT NULL,
  href        TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Trigger
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read contacts"
  ON contacts FOR SELECT USING (true);

CREATE POLICY "Auth insert contacts"
  ON contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update contacts"
  ON contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete contacts"
  ON contacts FOR DELETE TO authenticated USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_contacts_sort ON contacts (sort_order);

-- Seed data (optional)
INSERT INTO contacts (icon, label, href, sort_order) VALUES
  ('✉️', 'hello@example.com', 'mailto:hello@example.com', 1),
  ('🐙', 'GitHub',            'https://github.com',       2),
  ('💼', 'LinkedIn',          'https://linkedin.com',     3),
  ('🐦', 'Twitter',           'https://twitter.com',      4);
