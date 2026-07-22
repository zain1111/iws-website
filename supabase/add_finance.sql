-- Finance: salaries + transfer screenshot storage
-- Run once in Supabase SQL Editor

create table if not exists public.salaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  period_year int not null check (period_year >= 2000),
  period_month int not null check (period_month between 1 and 12),
  paid_on date not null default current_date,
  transfer_screenshot_path text,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (user_id, period_year, period_month)
);

alter table public.salaries enable row level security;

drop policy if exists "Admins manage salaries" on public.salaries;
drop policy if exists "Members read own salaries" on public.salaries;

create policy "Members read own salaries" on public.salaries
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage salaries" on public.salaries
  for all using (public.is_admin()) with check (public.is_admin());

-- Storage bucket for transfer screenshots (private)
insert into storage.buckets (id, name, public)
values ('salary-transfers', 'salary-transfers', false)
on conflict (id) do nothing;

drop policy if exists "Admins upload salary transfers" on storage.objects;
drop policy if exists "Admins update salary transfers" on storage.objects;
drop policy if exists "Admins delete salary transfers" on storage.objects;
drop policy if exists "Read own or admin salary transfers" on storage.objects;

create policy "Admins upload salary transfers" on storage.objects
  for insert with check (
    bucket_id = 'salary-transfers' and public.is_admin()
  );

create policy "Admins update salary transfers" on storage.objects
  for update using (
    bucket_id = 'salary-transfers' and public.is_admin()
  );

create policy "Admins delete salary transfers" on storage.objects
  for delete using (
    bucket_id = 'salary-transfers' and public.is_admin()
  );

-- Path convention: {user_id}/...
create policy "Read own or admin salary transfers" on storage.objects
  for select using (
    bucket_id = 'salary-transfers'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
