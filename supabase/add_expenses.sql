-- Office expenses for Finance section
-- Run once in Supabase SQL Editor

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'general',
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD' check (currency in ('USD', 'PKR')),
  expense_date date not null default current_date,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Tighten salary + invoice currencies when possible (app enforces USD/PKR)
alter table public.salaries
  drop constraint if exists salaries_currency_check;
alter table public.salaries
  add constraint salaries_currency_check check (currency in ('USD', 'PKR'));

alter table public.expenses enable row level security;

drop policy if exists "Admins manage expenses" on public.expenses;
create policy "Admins manage expenses" on public.expenses
  for all using (public.is_admin()) with check (public.is_admin());
