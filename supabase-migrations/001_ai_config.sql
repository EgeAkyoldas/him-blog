-- AI Config & Personas Tables for him-blog
-- Run this in Supabase SQL Editor

-- ─── AI Config (single-row global settings) ───
CREATE TABLE IF NOT EXISTS ai_config (
  id text PRIMARY KEY DEFAULT 'default',
  system_instruction text NOT NULL DEFAULT '',
  global_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_prompt text NOT NULL DEFAULT '',
  persona_defaults jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── AI Personas ───
CREATE TABLE IF NOT EXISTS ai_personas (
  id text PRIMARY KEY,
  name text NOT NULL,
  tone text NOT NULL DEFAULT '',
  instruction text NOT NULL DEFAULT '',
  writing_style_rules text DEFAULT '',
  negative_constraints text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_config_updated_at
  BEFORE UPDATE ON ai_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ai_personas_updated_at
  BEFORE UPDATE ON ai_personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Allow service role full access (admin only)
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on ai_config"
  ON ai_config FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on ai_personas"
  ON ai_personas FOR ALL
  USING (true) WITH CHECK (true);
