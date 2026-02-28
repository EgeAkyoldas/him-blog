-- Add unique constraint on article_translations for upsert to work
-- Run this in Supabase SQL Editor

ALTER TABLE article_translations
  ADD CONSTRAINT article_translations_article_id_language_key
  UNIQUE (article_id, language);
