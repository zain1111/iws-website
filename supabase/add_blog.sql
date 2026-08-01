-- Blog posts + AdSense slot settings
-- Run once in Supabase SQL Editor

-- ---------- Blog posts ----------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  featured_image_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  fiverr_url text,
  upwork_url text,
  published_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);

-- ---------- AdSense slot codes (site-wide) ----------
create table if not exists public.blog_ad_slots (
  slot_key text primary key,
  label text not null,
  ad_code text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.blog_ad_slots (slot_key, label, ad_code) values
  ('listing_banner', 'Blog listing page banner', ''),
  ('post_sidebar', 'Post sidebar (between Fiverr & Upwork)', ''),
  ('post_inline', 'Post mid-article break', ''),
  ('post_bottom', 'Post bottom (before book-a-call)', '')
on conflict (slot_key) do nothing;

-- ---------- Storage: public blog images ----------
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- ---------- RLS ----------
alter table public.blog_posts enable row level security;
alter table public.blog_ad_slots enable row level security;

drop policy if exists "Public read published posts" on public.blog_posts;
drop policy if exists "Admins manage blog posts" on public.blog_posts;
drop policy if exists "Public read ad slots" on public.blog_ad_slots;
drop policy if exists "Admins manage ad slots" on public.blog_ad_slots;

create policy "Public read published posts" on public.blog_posts
  for select using (status = 'published' or public.is_admin());

create policy "Admins manage blog posts" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public read ad slots" on public.blog_ad_slots
  for select using (true);

create policy "Admins manage ad slots" on public.blog_ad_slots
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read blog images" on storage.objects;
drop policy if exists "Admins upload blog images" on storage.objects;
drop policy if exists "Admins update blog images" on storage.objects;
drop policy if exists "Admins delete blog images" on storage.objects;

create policy "Public read blog images" on storage.objects
  for select using (bucket_id = 'blog-images');

create policy "Admins upload blog images" on storage.objects
  for insert with check (bucket_id = 'blog-images' and public.is_admin());

create policy "Admins update blog images" on storage.objects
  for update using (bucket_id = 'blog-images' and public.is_admin());

create policy "Admins delete blog images" on storage.objects
  for delete using (bucket_id = 'blog-images' and public.is_admin());
