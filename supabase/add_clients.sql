-- Incremental migration: Clients + links to projects/invoices
-- Run in Supabase SQL Editor if the main schema was already applied earlier.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists client_id uuid references public.clients(id) on delete set null;

alter table public.invoices
  add column if not exists client_id uuid references public.clients(id) on delete set null;

alter table public.clients enable row level security;

drop policy if exists "Admins manage clients" on public.clients;
drop policy if exists "Approved read clients" on public.clients;

create policy "Approved read clients" on public.clients
  for select using (public.is_approved());
create policy "Admins manage clients" on public.clients
  for all using (public.is_admin()) with check (public.is_admin());
