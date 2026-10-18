create table public.companies (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 200),
  siret text not null check (siret ~ '^[0-9]{14}$'),
  siren text generated always as (left(siret, 9)) stored,
  vat_id text,
  address jsonb,
  legal_notes jsonb not null default '[]',
  logo_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (created_by, siret)
);

create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner')),
  primary key (company_id, user_id)
);
create index on public.company_members (user_id);

create or replace function public.is_company_member(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = cid and m.user_id = auth.uid()
  );
$$;

alter table public.companies enable row level security;
alter table public.company_members enable row level security;

create policy "members read company" on public.companies
  for select using (public.is_company_member(id));
create policy "read own memberships" on public.company_members
  for select using (user_id = auth.uid());

-- Création atomique (Entreprise + Membre)
create or replace function public.create_company(p_name text, p_siret text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_company_id uuid;
  v_count int;
begin
  -- Vérifier la limite de 50 entreprises
  select count(*) into v_count from public.company_members where user_id = auth.uid();
  if v_count >= 50 then
    raise exception 'Limite de 50 entreprises atteinte pour ce compte.';
  end if;

  -- Insérer l'entreprise
  insert into public.companies (created_by, name, siret)
  values (auth.uid(), p_name, p_siret)
  returning id into v_company_id;

  -- Assigner l'utilisateur courant comme membre "owner"
  insert into public.company_members (company_id, user_id, role)
  values (v_company_id, auth.uid(), 'owner');

  return v_company_id;
end;
$$;

revoke execute on function public.create_company(text, text) from public, anon;
grant execute on function public.create_company(text, text) to authenticated;
