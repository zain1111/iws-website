-- Safer AdSense defaults: AI auto-publish OFF, 1 article/day max when re-enabled
-- Run in Supabase SQL Editor (safe to re-run)

update public.blog_ai_settings
set
  enabled = false,
  daily_article_count = 1,
  ai_topic_count = least(ai_topic_count, 1),
  updated_at = now()
where id = 1;

-- Ensure defaults for any fresh insert match the safer posture
alter table public.blog_ai_settings
  alter column enabled set default false;

alter table public.blog_ai_settings
  alter column daily_article_count set default 1;
