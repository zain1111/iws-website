-- IWS Admin Panel — run this in Supabase SQL Editor (once per project)
-- Dashboard → SQL → New query → paste → Run

create extension if not exists "pgcrypto";

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  phone text,
  cnic text,
  role text not null default 'member' check (role in ('member', 'admin', 'super_admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists phone text;
alter table public.profiles
  add column if not exists cnic text;

-- Auto-create profile on signup; super-admin email is auto-approved
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(new.email);
  v_name text := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_role text := 'member';
  v_status text := 'pending';
begin
  if v_email = 'zain@theiwsolutions.com' then
    v_role := 'super_admin';
    v_status := 'approved';
  end if;

  insert into public.profiles (id, email, full_name, role, status)
  values (new.id, v_email, v_name, v_role, v_status)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Sticky notes ----------
create table if not exists public.sticky_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  color text not null default '#FF5A45',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Clients (admin-managed, linkable to projects & invoices) ----------
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

-- ---------- Projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Safe for existing databases that already have projects without client_id
alter table public.projects
  add column if not exists client_id uuid references public.clients(id) on delete set null;

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

-- ---------- Tasks ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'ready_for_you', 'done')),
  due_date date,
  created_at timestamptz not null default now()
);

-- ---------- Messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  label text not null,
  url text not null,
  kind text not null default 'link' check (kind in ('google_doc', 'google_sheet', 'link'))
);

-- ---------- Invoices (admin only) ----------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null,
  client_email text,
  issue_date date not null default current_date,
  due_date date,
  items jsonb not null default '[]'::jsonb,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid')),
  currency text not null default 'USD',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.invoices
  add column if not exists client_id uuid references public.clients(id) on delete set null;

-- ---------- Salaries (payroll) ----------
create table if not exists public.salaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  tax_deduction numeric(12, 2) not null default 0 check (tax_deduction >= 0),
  loan_deduction numeric(12, 2) not null default 0 check (loan_deduction >= 0),
  currency text not null default 'USD' check (currency in ('USD', 'PKR')),
  period_year int not null check (period_year >= 2000),
  period_month int not null check (period_month between 1 and 12),
  paid_on date not null default current_date,
  transfer_screenshot_path text,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (user_id, period_year, period_month)
);

alter table public.salaries
  add column if not exists tax_deduction numeric(12, 2) not null default 0;
alter table public.salaries
  add column if not exists loan_deduction numeric(12, 2) not null default 0;

-- ---------- Office expenses (admin finance) ----------
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

-- ---------- Helpers ----------
create or replace function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_project_member(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = pid and user_id = auth.uid()
  ) or public.is_admin();
$$;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.sticky_notes enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.invoices enable row level security;
alter table public.clients enable row level security;
alter table public.salaries enable row level security;
alter table public.expenses enable row level security;

-- Drop existing policies so this script is safe to re-run
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Approved users read teammates" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Admins update any profile" on public.profiles;
drop policy if exists "Own notes select" on public.sticky_notes;
drop policy if exists "Own notes insert" on public.sticky_notes;
drop policy if exists "Own notes update" on public.sticky_notes;
drop policy if exists "Own notes delete" on public.sticky_notes;
drop policy if exists "Members see their projects" on public.projects;
drop policy if exists "Admins create projects" on public.projects;
drop policy if exists "Admins update projects" on public.projects;
drop policy if exists "Admins delete projects" on public.projects;
drop policy if exists "See project members if in project" on public.project_members;
drop policy if exists "Admins manage project members" on public.project_members;
drop policy if exists "See assigned or project tasks" on public.tasks;
drop policy if exists "Admins create tasks" on public.tasks;
drop policy if exists "Assignees and admins update tasks" on public.tasks;
drop policy if exists "Admins delete tasks" on public.tasks;
drop policy if exists "Project members read messages" on public.messages;
drop policy if exists "Project members send messages" on public.messages;
drop policy if exists "Read attachments via message access" on public.message_attachments;
drop policy if exists "Add attachments with message" on public.message_attachments;
drop policy if exists "Admins manage invoices" on public.invoices;
drop policy if exists "Admins manage clients" on public.clients;
drop policy if exists "Approved read clients" on public.clients;
drop policy if exists "Admins manage salaries" on public.salaries;
drop policy if exists "Members read own salaries" on public.salaries;
drop policy if exists "Admins manage expenses" on public.expenses;

-- Profiles
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "Approved users read teammates" on public.profiles
  for select using (public.is_approved() and status = 'approved');
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);
create policy "Admins update any profile" on public.profiles
  for update using (public.is_admin());

-- Sticky notes
create policy "Own notes select" on public.sticky_notes for select using (auth.uid() = user_id);
create policy "Own notes insert" on public.sticky_notes for insert with check (auth.uid() = user_id and public.is_approved());
create policy "Own notes update" on public.sticky_notes for update using (auth.uid() = user_id);
create policy "Own notes delete" on public.sticky_notes for delete using (auth.uid() = user_id);

-- Projects
create policy "Members see their projects" on public.projects
  for select using (public.is_project_member(id) or created_by = auth.uid());
create policy "Admins create projects" on public.projects
  for insert with check (public.is_admin());
create policy "Admins update projects" on public.projects
  for update using (public.is_admin());
create policy "Admins delete projects" on public.projects
  for delete using (public.is_admin());

-- Project members
create policy "See project members if in project" on public.project_members
  for select using (public.is_project_member(project_id));
create policy "Admins manage project members" on public.project_members
  for all using (public.is_admin()) with check (public.is_admin());

-- Tasks
create policy "See assigned or project tasks" on public.tasks
  for select using (
    assigned_to = auth.uid()
    or created_by = auth.uid()
    or (project_id is not null and public.is_project_member(project_id))
    or public.is_admin()
  );
create policy "Admins create tasks" on public.tasks
  for insert with check (public.is_admin());
create policy "Assignees and admins update tasks" on public.tasks
  for update using (assigned_to = auth.uid() or public.is_admin());
create policy "Admins delete tasks" on public.tasks
  for delete using (public.is_admin());

-- Messages
create policy "Project members read messages" on public.messages
  for select using (public.is_project_member(project_id));
create policy "Project members send messages" on public.messages
  for insert with check (public.is_project_member(project_id) and user_id = auth.uid());

-- Attachments
create policy "Read attachments via message access" on public.message_attachments
  for select using (
    exists (
      select 1 from public.messages m
      where m.id = message_id and public.is_project_member(m.project_id)
    )
  );
create policy "Add attachments with message" on public.message_attachments
  for insert with check (
    exists (
      select 1 from public.messages m
      where m.id = message_id and m.user_id = auth.uid() and public.is_project_member(m.project_id)
    )
  );

-- Clients
create policy "Approved read clients" on public.clients
  for select using (public.is_approved());
create policy "Admins manage clients" on public.clients
  for all using (public.is_admin()) with check (public.is_admin());

-- Invoices — admin only
create policy "Admins manage invoices" on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

-- Salaries
create policy "Members read own salaries" on public.salaries
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage salaries" on public.salaries
  for all using (public.is_admin()) with check (public.is_admin());

-- Expenses — admin only
create policy "Admins manage expenses" on public.expenses
  for all using (public.is_admin()) with check (public.is_admin());

-- Storage: salary transfer screenshots
insert into storage.buckets (id, name, public)
values ('salary-transfers', 'salary-transfers', false)
on conflict (id) do nothing;

drop policy if exists "Admins upload salary transfers" on storage.objects;
drop policy if exists "Admins update salary transfers" on storage.objects;
drop policy if exists "Admins delete salary transfers" on storage.objects;
drop policy if exists "Read own or admin salary transfers" on storage.objects;

create policy "Admins upload salary transfers" on storage.objects
  for insert with check (bucket_id = 'salary-transfers' and public.is_admin());
create policy "Admins update salary transfers" on storage.objects
  for update using (bucket_id = 'salary-transfers' and public.is_admin());
create policy "Admins delete salary transfers" on storage.objects
  for delete using (bucket_id = 'salary-transfers' and public.is_admin());
create policy "Read own or admin salary transfers" on storage.objects
  for select using (
    bucket_id = 'salary-transfers'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Realtime for project chat (safe if already added)
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.message_attachments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.project_members;
exception when duplicate_object then null;
end $$;
