-- AI Publisher settings (singleton row id = 1)
-- Run after add_blog_ai.sql

create table if not exists public.blog_ai_settings (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default true,
  schedule_hour_utc int not null default 6 check (schedule_hour_utc between 0 and 23),
  daily_article_count int not null default 3 check (daily_article_count between 1 and 3),
  ai_topic_count int not null default 1 check (ai_topic_count between 0 and 3),
  last_scheduled_run_on date,
  updated_at timestamptz not null default now()
);

insert into public.blog_ai_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.blog_ai_settings enable row level security;

drop policy if exists "Admins manage blog ai settings" on public.blog_ai_settings;
create policy "Admins manage blog ai settings" on public.blog_ai_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Service role (Netlify schedule) bypasses RLS; no public read needed.
