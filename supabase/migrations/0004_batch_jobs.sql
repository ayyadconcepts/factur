-- Migration: 0004_batch_jobs.sql
-- Description: Gestion des conversions groupées (Bulk conversion) et organisation en dossiers dédiés

-- 1. Table des dossiers (si pas encore créée)
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  parent_id uuid references public.folders(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS pour les dossiers
alter table public.folders enable row level security;

drop policy if exists "Users can manage their own folders" on public.folders;
create policy "Users can manage their own folders" on public.folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Ajout de la colonne folder_id sur invoices pour le classement dans les dossiers
alter table public.invoices add column if not exists folder_id uuid references public.folders(id) on delete set null;
create index if not exists idx_invoices_folder_id on public.invoices (folder_id);

-- 2. Table des lots (batch_jobs)
create table if not exists public.batch_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Lot du ' || to_char(now(), 'DD/MM/YYYY HH24:MI'),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  total_files integer not null default 0,
  processed_count integer not null default 0,
  success_count integer not null default 0,
  error_count integer not null default 0,
  folder_id uuid references public.folders(id) on delete set null,
  zip_r2_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS activé immédiatement
alter table public.batch_jobs enable row level security;

-- Index pour recherche rapide par utilisateur
create index if not exists idx_batch_jobs_user_id on public.batch_jobs (user_id);
create index if not exists idx_batch_jobs_status on public.batch_jobs (status);
create index if not exists idx_batch_jobs_folder_id on public.batch_jobs (folder_id);

-- Politiques de sécurité pour batch_jobs
drop policy if exists "users read own batch_jobs" on public.batch_jobs;
create policy "users read own batch_jobs" on public.batch_jobs
  for select using (auth.uid() = user_id);

drop policy if exists "users insert own batch_jobs" on public.batch_jobs;
create policy "users insert own batch_jobs" on public.batch_jobs
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update own batch_jobs" on public.batch_jobs;
create policy "users update own batch_jobs" on public.batch_jobs
  for update using (auth.uid() = user_id);

drop policy if exists "users delete own batch_jobs" on public.batch_jobs;
create policy "users delete own batch_jobs" on public.batch_jobs
  for delete using (auth.uid() = user_id);

-- 3. Table des éléments individuels d'un lot
create table if not exists public.batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batch_jobs(id) on delete cascade,
  file_name text not null,
  raw_r2_key text not null,
  facturx_r2_key text,
  invoice_id uuid references public.invoices(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'success', 'error')),
  error_message text,
  invoice_number text,
  total_incl_vat numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS activé immédiatement
alter table public.batch_items enable row level security;

-- Index
create index if not exists idx_batch_items_batch_id on public.batch_items (batch_id);
create index if not exists idx_batch_items_status on public.batch_items (status);

-- Politiques de sécurité pour batch_items (liées à l'utilisateur du lot)
drop policy if exists "users read own batch_items" on public.batch_items;
create policy "users read own batch_items" on public.batch_items
  for select using (
    exists (
      select 1 from public.batch_jobs
      where public.batch_jobs.id = public.batch_items.batch_id
        and public.batch_jobs.user_id = auth.uid()
    )
  );

drop policy if exists "users insert own batch_items" on public.batch_items;
create policy "users insert own batch_items" on public.batch_items
  for insert with check (
    exists (
      select 1 from public.batch_jobs
      where public.batch_jobs.id = public.batch_items.batch_id
        and public.batch_jobs.user_id = auth.uid()
    )
  );

drop policy if exists "users update own batch_items" on public.batch_items;
create policy "users update own batch_items" on public.batch_items
  for update using (
    exists (
      select 1 from public.batch_jobs
      where public.batch_jobs.id = public.batch_items.batch_id
        and public.batch_jobs.user_id = auth.uid()
    )
  );

drop policy if exists "users delete own batch_items" on public.batch_items;
create policy "users delete own batch_items" on public.batch_items
  for delete using (
    exists (
      select 1 from public.batch_jobs
      where public.batch_jobs.id = public.batch_items.batch_id
        and public.batch_jobs.user_id = auth.uid()
    )
  );
