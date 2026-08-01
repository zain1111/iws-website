-- Blog SEO fields + AI publisher run logs
-- Run after add_blog.sql

alter table public.blog_posts
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists focus_keyword text,
  add column if not exists image_alt text,
  add column if not exists source_topic text,
  add column if not exists ai_generated boolean not null default false;

create table if not exists public.blog_ai_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running' check (status in ('running', 'success', 'partial', 'failed')),
  trigger text not null default 'manual' check (trigger in ('manual', 'schedule')),
  articles_requested int not null default 3,
  articles_published int not null default 0,
  log jsonb not null default '[]'::jsonb,
  error text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.blog_ai_runs enable row level security;

drop policy if exists "Admins manage blog ai runs" on public.blog_ai_runs;
create policy "Admins manage blog ai runs" on public.blog_ai_runs
  for all using (public.is_admin()) with check (public.is_admin());
