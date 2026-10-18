-- Run once in Supabase SQL Editor BEFORE deploying the launch changes.
-- Existing profile/schema migrations are still required.
begin;
create table if not exists public.telegram_codes (
  code text primary key,
  telegram_id bigint not null,
  username text,
  first_name text,
  expires_at timestamptz not null
);
alter table public.telegram_codes enable row level security;
revoke all on public.telegram_codes from anon, authenticated;
grant all on public.telegram_codes to service_role;
create index if not exists telegram_codes_expiry_idx on public.telegram_codes(expires_at);

create table if not exists public.empira_rate_limits (
  bucket text primary key,
  started_at timestamptz not null,
  requests integer not null
);
alter table public.empira_rate_limits enable row level security;
revoke all on public.empira_rate_limits from anon, authenticated;
create index if not exists empira_rate_limits_expiry_idx on public.empira_rate_limits(started_at);

create or replace function public.empira_take_rate_limit(bucket text, maximum integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare hits integer; now_at timestamptz := clock_timestamp();
begin
  if maximum < 1 or maximum > 10000 or window_seconds < 1 or window_seconds > 86400 or length(bucket) > 200 then
    raise exception 'Invalid rate limit';
  end if;
  delete from public.empira_rate_limits r where r.started_at < now_at - interval '1 day';
  insert into public.empira_rate_limits as r(bucket, started_at, requests)
  values (bucket, now_at, 1)
  on conflict on constraint empira_rate_limits_pkey do update
    set requests = case when r.started_at <= now_at - make_interval(secs => window_seconds) then 1 else least(r.requests + 1, 10001) end,
        started_at = case when r.started_at <= now_at - make_interval(secs => window_seconds) then now_at else r.started_at end
  returning requests into hits;
  return hits <= maximum;
end $$;

create or replace function public.empira_issue_telegram_code(p_code text, p_telegram_id bigint, p_username text, p_first_name text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_code !~ '^[0-9]{6}$' or p_telegram_id <= 0 then raise exception 'Invalid code'; end if;
  -- Serialize code issuance per Telegram account, including the first code.
  perform pg_advisory_xact_lock(p_telegram_id);
  delete from public.telegram_codes where telegram_id = p_telegram_id or expires_at < now();
  insert into public.telegram_codes(code, telegram_id, username, first_name, expires_at)
    values (p_code, p_telegram_id, p_username, p_first_name, now() + interval '5 minutes');
  return true;
exception when unique_violation then return false;
end $$;

create or replace function public.empira_consume_telegram_code(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  delete from public.telegram_codes c where c.code = p_code and c.expires_at > now()
    returning jsonb_build_object('telegram_id', c.telegram_id, 'username', c.username, 'first_name', c.first_name) into result;
  return result;
end $$;
revoke all on function public.empira_take_rate_limit(text,integer,integer) from public, anon, authenticated;
revoke all on function public.empira_issue_telegram_code(text,bigint,text,text) from public, anon, authenticated;
revoke all on function public.empira_consume_telegram_code(text) from public, anon, authenticated;
grant execute on function public.empira_take_rate_limit(text,integer,integer) to service_role;
grant execute on function public.empira_issue_telegram_code(text,bigint,text,text) to service_role;
grant execute on function public.empira_consume_telegram_code(text) to service_role;

create table if not exists public.lab_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id text not null check (lab_id ~ '^[a-z0-9-]{1,100}$'),
  mode text not null check (mode in ('ready','build')),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) <= 100000),
  updated_at timestamptz not null default now(),
  primary key(user_id,lab_id,mode)
);
alter table public.lab_progress enable row level security;
revoke all on public.lab_progress from anon;
grant select, insert, update, delete on public.lab_progress to authenticated;
drop policy if exists own_lab_progress on public.lab_progress;
create policy own_lab_progress on public.lab_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
commit;
