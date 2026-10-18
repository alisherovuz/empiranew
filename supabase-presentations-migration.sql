-- Empira — saved AI lesson presentations (run once in Supabase SQL Editor). Additive & safe.
begin;

create table if not exists public.empira_presentations (
  id uuid primary key default gen_random_uuid(),
  topic_slug text not null,
  grade int check (grade between 1 and 11),
  title text not null,
  slides jsonb not null check (jsonb_typeof(slides) = 'array' and octet_length(slides::text) <= 60000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (topic_slug, grade)
);

alter table public.empira_presentations enable row level security;

-- Any signed-in user can read saved lessons; writes go through the RPC below (teachers/admins only).
drop policy if exists ep_read on public.empira_presentations;
create policy ep_read on public.empira_presentations for select to authenticated using (true);

create or replace function public.empira_save_presentation(p_slug text, p_grade int, p_title text, p_slides jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); r text;
begin
  if uid is null then raise exception 'auth required'; end if;
  if jsonb_typeof(p_slides) <> 'array' or octet_length(p_slides::text) > 60000 then raise exception 'bad slides'; end if;
  select role into r from public.profiles where id = uid;
  if r is distinct from 'teacher' and r is distinct from 'admin' then raise exception 'teachers only'; end if;
  insert into public.empira_presentations(topic_slug, grade, title, slides, updated_by, updated_at)
    values (p_slug, p_grade, left(p_title, 120), p_slides, uid, now())
  on conflict (topic_slug, grade) do update
    set title = excluded.title, slides = excluded.slides, updated_by = uid, updated_at = now();
end $$;

revoke all on function public.empira_save_presentation(text,int,text,jsonb) from public, anon;
grant execute on function public.empira_save_presentation(text,int,text,jsonb) to authenticated;

-- Storage bucket for AI deck images (public read; writes via service key).
insert into storage.buckets (id, name, public) values ('decks','decks',true)
  on conflict (id) do update set public = true;

commit;
