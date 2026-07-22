-- Phone on profiles + tax/loan on salaries
-- Run once in Supabase SQL Editor

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists cnic text;

alter table public.salaries
  add column if not exists tax_deduction numeric(12, 2) not null default 0 check (tax_deduction >= 0);

alter table public.salaries
  add column if not exists loan_deduction numeric(12, 2) not null default 0 check (loan_deduction >= 0);
