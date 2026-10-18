-- Empira — real classes, enrollments, quiz answers (run once in Supabase SQL Editor).
-- Additive and safe: creates new empira_* tables; does not touch existing tables.
begin;

create table if not exists public.empira_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  grade int check (grade between 1 and 11),
  code text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists empira_classes_teacher_idx on public.empira_classes(teacher_id);

create table if not exists public.empira_enrollments (
  class_id uuid not null references public.empira_classes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index if not exists empira_enrollments_student_idx on public.empira_enrollments(student_id);

create table if not exists public.empira_quiz_answers (
  id bigint generated always as identity primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.empira_classes(id) on delete set null,
  lab_id text not null check (lab_id ~ '^[a-z0-9-]{1,100}$'),
  topic_slug text,
  grade int check (grade between 1 and 11),
  question_idx int not null check (question_idx between 0 and 50),
  correct boolean not null,
  chosen int,
  created_at timestamptz not null default now()
);
create index if not exists empira_quiz_student_idx on public.empira_quiz_answers(student_id, created_at);
create index if not exists empira_quiz_class_idx on public.empira_quiz_answers(class_id, lab_id);

alter table public.empira_classes     enable row level security;
alter table public.empira_enrollments enable row level security;
alter table public.empira_quiz_answers enable row level security;

-- ---- RLS ----
drop policy if exists ec_teacher_all on public.empira_classes;
create policy ec_teacher_all on public.empira_classes for all to authenticated
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));
drop policy if exists ec_student_read on public.empira_classes;
create policy ec_student_read on public.empira_classes for select to authenticated
  using (exists (select 1 from public.empira_enrollments e where e.class_id = id and e.student_id = (select auth.uid())));

drop policy if exists ee_student on public.empira_enrollments;
create policy ee_student on public.empira_enrollments for all to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));
drop policy if exists ee_teacher_read on public.empira_enrollments;
create policy ee_teacher_read on public.empira_enrollments for select to authenticated
  using (exists (select 1 from public.empira_classes c where c.id = class_id and c.teacher_id = (select auth.uid())));

drop policy if exists eq_student on public.empira_quiz_answers;
create policy eq_student on public.empira_quiz_answers for all to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));
drop policy if exists eq_teacher_read on public.empira_quiz_answers;
create policy eq_teacher_read on public.empira_quiz_answers for select to authenticated
  using (class_id is not null and exists (select 1 from public.empira_classes c where c.id = class_id and c.teacher_id = (select auth.uid())));

-- ---- RPCs (security definer; access checked inside) ----
create or replace function public.empira_create_class(p_title text, p_grade int)
returns public.empira_classes language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); c public.empira_classes; new_code text; tries int := 0;
begin
  if uid is null then raise exception 'auth required'; end if;
  if p_title is null or char_length(btrim(p_title)) < 1 then raise exception 'title required'; end if;
  loop
    tries := tries + 1;
    new_code := substr(upper(translate(md5(random()::text || clock_timestamp()::text), '01', 'gh')), 1, 6);
    begin
      insert into public.empira_classes(teacher_id, title, grade, code)
        values (uid, left(btrim(p_title), 80), nullif(p_grade, 0), new_code)
        returning * into c;
      return c;
    exception when unique_violation then
      if tries > 8 then raise exception 'code generation failed'; end if;
    end;
  end loop;
end $$;

create or replace function public.empira_join_class(p_code text)
returns public.empira_classes language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); c public.empira_classes;
begin
  if uid is null then raise exception 'auth required'; end if;
  select * into c from public.empira_classes where upper(code) = upper(btrim(p_code));
  if c.id is null then raise exception 'class not found'; end if;
  insert into public.empira_enrollments(class_id, student_id) values (c.id, uid)
    on conflict do nothing;
  return c;
end $$;

create or replace function public.empira_teacher_classes()
returns table(id uuid, title text, grade int, code text, students bigint, created_at timestamptz)
language sql security definer set search_path = '' as $$
  select c.id, c.title, c.grade, c.code,
    (select count(*) from public.empira_enrollments e where e.class_id = c.id),
    c.created_at
  from public.empira_classes c
  where c.teacher_id = auth.uid()
  order by c.created_at desc;
$$;

create or replace function public.empira_class_roster(p_class uuid)
returns table(student_id uuid, name text, joined_at timestamptz)
language sql security definer set search_path = '' as $$
  select e.student_id, coalesce(nullif(btrim(p.full_name), ''), p.username, 'O''quvchi'), e.joined_at
  from public.empira_enrollments e
  left join public.profiles p on p.id = e.student_id
  where e.class_id = p_class
    and exists (select 1 from public.empira_classes c where c.id = p_class and c.teacher_id = auth.uid())
  order by e.joined_at;
$$;

create or replace function public.empira_my_classes()
returns table(id uuid, title text, grade int, teacher text)
language sql security definer set search_path = '' as $$
  select c.id, c.title, c.grade, coalesce(nullif(btrim(tp.full_name), ''), 'O''qituvchi')
  from public.empira_enrollments e
  join public.empira_classes c on c.id = e.class_id
  left join public.profiles tp on tp.id = c.teacher_id
  where e.student_id = auth.uid()
  order by e.joined_at desc;
$$;

revoke all on function public.empira_create_class(text,int)   from public, anon;
revoke all on function public.empira_join_class(text)         from public, anon;
revoke all on function public.empira_teacher_classes()        from public, anon;
revoke all on function public.empira_class_roster(uuid)       from public, anon;
revoke all on function public.empira_my_classes()             from public, anon;
grant execute on function public.empira_create_class(text,int) to authenticated;
grant execute on function public.empira_join_class(text)       to authenticated;
grant execute on function public.empira_teacher_classes()      to authenticated;
grant execute on function public.empira_class_roster(uuid)     to authenticated;
grant execute on function public.empira_my_classes()           to authenticated;

commit;
