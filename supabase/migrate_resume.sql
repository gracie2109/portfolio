-- ─────────────────────────────────────────────────────
-- Resume Table Migration
-- Stores resume PDF links for different languages
-- ─────────────────────────────────────────────────────

-- Create resume table
CREATE TABLE IF NOT EXISTS resume (
  id SERIAL PRIMARY KEY,
  name VARCHAR(10) NOT NULL CHECK (name IN ('en', 'vi')),
  link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on name (only one resume per language)
CREATE UNIQUE INDEX IF NOT EXISTS idx_resume_name ON resume(name);

-- Enable Row Level Security
ALTER TABLE resume ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access on resume"
  ON resume
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to manage resumes
CREATE POLICY "Allow authenticated users to manage resume"
  ON resume
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample data (optional - replace with actual links)
-- INSERT INTO resume (name, link) VALUES
--   ('en', 'https://example.com/resume-en.pdf'),
--   ('vi', 'https://example.com/resume-vi.pdf')
-- ON CONFLICT (name) DO UPDATE SET link = EXCLUDED.link, updated_at = NOW();

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_resume_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_resume_updated_at ON resume;
CREATE TRIGGER trigger_resume_updated_at
  BEFORE UPDATE ON resume
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_updated_at();
