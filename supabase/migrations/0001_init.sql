create table public.seller_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  name text not null,
  siren text not null,
  siret text,
  vat_id text,
  address jsonb not null,
  legal_notes jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  number text not null,
  type_code text not null check (type_code in ('380','381')),
  related_invoice_id uuid references public.invoices(id),
  issue_date date not null,
  due_date date,
  currency char(3) not null,
  buyer_name text not null,
  buyer_siren text,
  total_excl_vat numeric(14,2) not null,
  total_vat numeric(14,2) not null,
  total_incl_vat numeric(14,2) not null,
  profile text not null,
  mode text not null check (mode in ('GARANTI','FIDELE')),
  invoice jsonb not null,
  report jsonb not null,
  facturx_key text not null,
  facturx_sha256 text not null,
  unique (user_id, number)
);
create index on public.invoices (user_id, issue_date desc);
create index on public.invoices (user_id, buyer_name);

alter table public.seller_profiles enable row level security;
alter table public.invoices enable row level security;

create policy "own seller profile" on public.seller_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "read own invoices" on public.invoices
  for select using (auth.uid() = user_id);

create or replace function public.invoices_immutable() returns trigger
language plpgsql as $$
begin
  if (new.number, new.issue_date, new.invoice, new.facturx_key, new.facturx_sha256)
     is distinct from
     (old.number, old.issue_date, old.invoice, old.facturx_key, old.facturx_sha256) then
    raise exception 'invoice is immutable';
  end if;
  return new;
end $$;
create trigger invoices_immutable before update on public.invoices
  for each row execute function public.invoices_immutable();
