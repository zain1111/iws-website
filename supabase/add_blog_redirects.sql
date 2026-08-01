-- Deleted-post 301 redirects → /blog (or custom target)
-- Run in Supabase SQL Editor after add_blog.sql

create table if not exists public.blog_redirects (
  slug text primary key,
  target text not null default '/blog',
  created_at timestamptz not null default now()
);

create index if not exists blog_redirects_created_at_idx
  on public.blog_redirects (created_at desc);

alter table public.blog_redirects enable row level security;

drop policy if exists "Public read blog redirects" on public.blog_redirects;
drop policy if exists "Admins manage blog redirects" on public.blog_redirects;

-- Crawlers / edge functions need to resolve deleted slugs
create policy "Public read blog redirects" on public.blog_redirects
  for select using (true);

create policy "Admins manage blog redirects" on public.blog_redirects
  for all using (public.is_admin()) with check (public.is_admin());
