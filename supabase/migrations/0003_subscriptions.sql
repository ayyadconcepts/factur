-- Migration: 0003_subscriptions.sql
-- Description: Gestion des abonnements utilisateurs (Essentiel, Volume, Intensif) et quotas Factur-X

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_id text not null default 'free' check (plan_id in ('free', 'essentiel', 'volume', 'intensif')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  paddle_customer_id text,
  paddle_subscription_id text,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '1 month'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS activé immédiatement
alter table public.subscriptions enable row level security;

-- Index pour recherche rapide par utilisateur ou webhook Paddle
create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);
create index if not exists idx_subscriptions_paddle_sub_id on public.subscriptions (paddle_subscription_id);

-- Politique de sécurité (lecture de son propre abonnement)
drop policy if exists "users read own subscription" on public.subscriptions;
create policy "users read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Fonction déclencheur pour créer automatiquement l'abonnement d'essai gratuit à l'inscription
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  values (
    new.id,
    'free',
    'active',
    now(),
    now() + interval '1 month'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Trigger sur création d'un compte auth.users
drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- Backfill pour les utilisateurs existants
insert into public.subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
select id, 'free', 'active', now(), now() + interval '1 month'
from auth.users
on conflict (user_id) do nothing;

-- Fonction RPC pour récupérer de manière atomique l'abonnement et le nombre de factures du mois en cours
create or replace function public.get_user_subscription_usage(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub public.subscriptions%rowtype;
  v_count integer;
begin
  -- Récupérer l'abonnement de l'utilisateur
  select * into v_sub
  from public.subscriptions
  where user_id = p_user_id;

  -- Si aucun abonnement n'existe (sécurité), créer le plan gratuit
  if not found then
    insert into public.subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
    values (p_user_id, 'free', 'active', now(), now() + interval '1 month')
    returning * into v_sub;
  end if;

  -- Si la période d'abonnement est expirée sans renouvellement (ex: plan gratuit ou fin de mois), rafraîchir la période
  if v_sub.current_period_end < now() then
    update public.subscriptions
    set current_period_start = now(),
        current_period_end = now() + interval '1 month',
        updated_at = now()
    where user_id = p_user_id
    returning * into v_sub;
  end if;

  -- Compter le nombre de factures créées dans la période courante
  select count(*) into v_count
  from public.invoices
  where user_id = p_user_id
    and created_at >= v_sub.current_period_start
    and created_at < v_sub.current_period_end;

  return json_build_object(
    'plan_id', v_sub.plan_id,
    'status', v_sub.status,
    'usage_count', coalesce(v_count, 0),
    'current_period_start', v_sub.current_period_start,
    'current_period_end', v_sub.current_period_end,
    'paddle_subscription_id', v_sub.paddle_subscription_id
  );
end;
$$;
