-- Empira FINAL apply: resets public schema then builds the full local schema.
-- Safe to run repeatedly (DROP SCHEMA ... CASCADE first). No real data yet.
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
ALTER SCHEMA public OWNER TO empira_app;
GRANT ALL ON SCHEMA public TO empira_app;
GRANT USAGE ON SCHEMA public TO public;

-- ============================================================================
-- Empira — local PostgreSQL schema (full Supabase replacement)
-- Trusted server code connects as empira_app and enforces authorization in Node.
-- No RLS / auth.uid() / anon|authenticated roles — those were Supabase-isms.
-- Class/report functions are ported to take the caller's user id as a parameter.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ AUTH ============
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT,                       -- null for Google-only accounts
  provider        TEXT NOT NULL DEFAULT 'password',  -- 'password' | 'google' | 'telegram'
  google_sub      TEXT UNIQUE,                -- Google subject id (OIDC 'sub')
  email_confirmed BOOLEAN NOT NULL DEFAULT false,
  user_metadata   JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token  TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_access  ON sessions(access_token);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh ON sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role             TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher','student','admin')),
  full_name        TEXT,
  email            TEXT,
  username         TEXT,
  school           TEXT,
  region           TEXT,
  district         TEXT,
  institution_type TEXT,
  subjects         TEXT[],
  grades           INTEGER[],
  student_counts   JSONB,
  onboarded        BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ LAB PROGRESS ============
CREATE TABLE IF NOT EXISTS lab_progress (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lab_id     TEXT NOT NULL CHECK (lab_id ~ '^[a-z0-9-]{1,100}$'),
  mode       TEXT NOT NULL CHECK (mode IN ('ready','build')),
  snapshot   JSONB NOT NULL CHECK (jsonb_typeof(snapshot) = 'object' AND octet_length(snapshot::text) <= 100000),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lab_id, mode)
);

-- ============ TELEGRAM ============
CREATE TABLE IF NOT EXISTS telegram_users (
  telegram_id BIGINT PRIMARY KEY,
  username    TEXT,
  first_name  TEXT,
  photo_url   TEXT,
  first_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telegram_codes (
  code        TEXT PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  username    TEXT,
  first_name  TEXT,
  photo_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS telegram_codes_expiry_idx ON telegram_codes(expires_at);

-- ============ RATE LIMITING ============
CREATE TABLE IF NOT EXISTS empira_rate_limits (
  bucket     TEXT PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL,
  requests   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS empira_rate_limits_expiry_idx ON empira_rate_limits(started_at);

-- ============ CLASSES / ENROLLMENTS / QUIZ ============
CREATE TABLE IF NOT EXISTS empira_classes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 80),
  grade      INT CHECK (grade BETWEEN 1 AND 11),
  code       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS empira_classes_teacher_idx ON empira_classes(teacher_id);

CREATE TABLE IF NOT EXISTS empira_enrollments (
  class_id   UUID NOT NULL REFERENCES empira_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, student_id)
);
CREATE INDEX IF NOT EXISTS empira_enrollments_student_idx ON empira_enrollments(student_id);

CREATE TABLE IF NOT EXISTS empira_quiz_answers (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id     UUID REFERENCES empira_classes(id) ON DELETE SET NULL,
  lab_id       TEXT NOT NULL CHECK (lab_id ~ '^[a-z0-9-]{1,100}$'),
  topic_slug   TEXT,
  grade        INT CHECK (grade BETWEEN 1 AND 11),
  question_idx INT NOT NULL CHECK (question_idx BETWEEN 0 AND 50),
  correct      BOOLEAN NOT NULL,
  chosen       INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS empira_quiz_student_idx ON empira_quiz_answers(student_id, created_at);
CREATE INDEX IF NOT EXISTS empira_quiz_class_idx   ON empira_quiz_answers(class_id, lab_id);

-- ============ PRESENTATIONS ============
CREATE TABLE IF NOT EXISTS empira_presentations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_slug TEXT NOT NULL,
  grade      INT CHECK (grade BETWEEN 1 AND 11),
  title      TEXT NOT NULL,
  slides     JSONB NOT NULL CHECK (jsonb_typeof(slides) = 'array' AND octet_length(slides::text) <= 60000),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (topic_slug, grade)
);

-- ============================================================================
-- FUNCTIONS (self-contained logic ported verbatim; no auth.uid)
-- ============================================================================

-- Rate limiter (token/window), ported from launch_readiness migration.
CREATE OR REPLACE FUNCTION empira_take_rate_limit(bucket TEXT, maximum INTEGER, window_seconds INTEGER)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE hits INTEGER; now_at TIMESTAMPTZ := clock_timestamp();
BEGIN
  IF maximum < 1 OR maximum > 10000 OR window_seconds < 1 OR window_seconds > 86400 OR length(bucket) > 200 THEN
    RAISE EXCEPTION 'Invalid rate limit';
  END IF;
  DELETE FROM empira_rate_limits r WHERE r.started_at < now_at - interval '1 day';
  INSERT INTO empira_rate_limits AS r(bucket, started_at, requests)
  VALUES (bucket, now_at, 1)
  ON CONFLICT ON CONSTRAINT empira_rate_limits_pkey DO UPDATE
    SET requests = CASE WHEN r.started_at <= now_at - make_interval(secs => window_seconds) THEN 1 ELSE least(r.requests + 1, 10001) END,
        started_at = CASE WHEN r.started_at <= now_at - make_interval(secs => window_seconds) THEN now_at ELSE r.started_at END
  RETURNING requests INTO hits;
  RETURN hits <= maximum;
END $$;

-- Issue a Telegram login code (advisory lock serializes per account).
CREATE OR REPLACE FUNCTION empira_issue_telegram_code(p_code TEXT, p_telegram_id BIGINT, p_username TEXT, p_first_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  IF p_code !~ '^[0-9]{6}$' OR p_telegram_id <= 0 THEN RAISE EXCEPTION 'Invalid code'; END IF;
  PERFORM pg_advisory_xact_lock(p_telegram_id);
  DELETE FROM telegram_codes WHERE telegram_id = p_telegram_id OR expires_at < now();
  INSERT INTO telegram_codes(code, telegram_id, username, first_name, expires_at)
    VALUES (p_code, p_telegram_id, p_username, p_first_name, now() + interval '5 minutes');
  RETURN true;
EXCEPTION WHEN unique_violation THEN RETURN false;
END $$;

-- Consume a Telegram code exactly once, returning its payload as JSONB (or NULL).
CREATE OR REPLACE FUNCTION empira_consume_telegram_code(p_code TEXT)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE result JSONB;
BEGIN
  DELETE FROM telegram_codes c WHERE c.code = p_code AND c.expires_at > now()
    RETURNING jsonb_build_object('telegram_id', c.telegram_id, 'username', c.username, 'first_name', c.first_name) INTO result;
  RETURN result;
END $$;

-- Create a class for a teacher (uid passed explicitly). Unique 6-char code.
CREATE OR REPLACE FUNCTION empira_create_class(p_uid UUID, p_title TEXT, p_grade INT)
RETURNS empira_classes LANGUAGE plpgsql AS $$
DECLARE c empira_classes; new_code TEXT; tries INT := 0;
BEGIN
  IF p_uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF p_title IS NULL OR char_length(btrim(p_title)) < 1 THEN RAISE EXCEPTION 'title required'; END IF;
  LOOP
    tries := tries + 1;
    new_code := substr(upper(translate(md5(random()::text || clock_timestamp()::text), '01', 'gh')), 1, 6);
    BEGIN
      INSERT INTO empira_classes(teacher_id, title, grade, code)
        VALUES (p_uid, left(btrim(p_title), 80), nullif(p_grade, 0), new_code)
        RETURNING * INTO c;
      RETURN c;
    EXCEPTION WHEN unique_violation THEN
      IF tries > 8 THEN RAISE EXCEPTION 'code generation failed'; END IF;
    END;
  END LOOP;
END $$;

-- Student joins a class by code.
CREATE OR REPLACE FUNCTION empira_join_class(p_uid UUID, p_code TEXT)
RETURNS empira_classes LANGUAGE plpgsql AS $$
DECLARE c empira_classes;
BEGIN
  IF p_uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  SELECT * INTO c FROM empira_classes WHERE upper(code) = upper(btrim(p_code));
  IF c.id IS NULL THEN RAISE EXCEPTION 'class not found'; END IF;
  INSERT INTO empira_enrollments(class_id, student_id) VALUES (c.id, p_uid) ON CONFLICT DO NOTHING;
  RETURN c;
END $$;

-- Teacher's classes with student counts.
CREATE OR REPLACE FUNCTION empira_teacher_classes(p_uid UUID)
RETURNS TABLE(id UUID, title TEXT, grade INT, code TEXT, students BIGINT, created_at TIMESTAMPTZ)
LANGUAGE sql AS $$
  SELECT c.id, c.title, c.grade, c.code,
    (SELECT count(*) FROM empira_enrollments e WHERE e.class_id = c.id),
    c.created_at
  FROM empira_classes c
  WHERE c.teacher_id = p_uid
  ORDER BY c.created_at DESC;
$$;

-- Roster of a class the caller owns.
CREATE OR REPLACE FUNCTION empira_class_roster(p_uid UUID, p_class UUID)
RETURNS TABLE(student_id UUID, name TEXT, joined_at TIMESTAMPTZ)
LANGUAGE sql AS $$
  SELECT e.student_id, coalesce(nullif(btrim(p.full_name), ''), p.username, 'O''quvchi'), e.joined_at
  FROM empira_enrollments e
  LEFT JOIN profiles p ON p.id = e.student_id
  WHERE e.class_id = p_class
    AND exists (SELECT 1 FROM empira_classes c WHERE c.id = p_class AND c.teacher_id = p_uid)
  ORDER BY e.joined_at;
$$;

-- Student's enrolled classes.
CREATE OR REPLACE FUNCTION empira_my_classes(p_uid UUID)
RETURNS TABLE(id UUID, title TEXT, grade INT, teacher TEXT)
LANGUAGE sql AS $$
  SELECT c.id, c.title, c.grade, coalesce(nullif(btrim(tp.full_name), ''), 'O''qituvchi')
  FROM empira_enrollments e
  JOIN empira_classes c ON c.id = e.class_id
  LEFT JOIN profiles tp ON tp.id = c.teacher_id
  WHERE e.student_id = p_uid
  ORDER BY e.joined_at DESC;
$$;

-- Per-lab aggregate report for a teacher's class (latest answer per question).
CREATE OR REPLACE FUNCTION empira_class_report(p_uid UUID, p_class UUID)
RETURNS TABLE(lab_id TEXT, students BIGINT, answers BIGINT, correct BIGINT)
LANGUAGE sql AS $$
  WITH latest AS (
    SELECT DISTINCT ON (q.student_id, q.lab_id, q.question_idx)
           q.student_id, q.lab_id, q.correct
    FROM empira_quiz_answers q
    JOIN empira_enrollments e ON e.student_id = q.student_id AND e.class_id = p_class
    WHERE exists (SELECT 1 FROM empira_classes c WHERE c.id = p_class AND c.teacher_id = p_uid)
    ORDER BY q.student_id, q.lab_id, q.question_idx, q.created_at DESC
  )
  SELECT lab_id, count(DISTINCT student_id), count(*), count(*) FILTER (WHERE correct)
  FROM latest GROUP BY lab_id
  ORDER BY (count(*) FILTER (WHERE correct))::numeric / nullif(count(*), 0) ASC NULLS LAST;
$$;

-- Per-student aggregate report for a teacher's class.
CREATE OR REPLACE FUNCTION empira_class_students(p_uid UUID, p_class UUID)
RETURNS TABLE(student_id UUID, name TEXT, labs BIGINT, answers BIGINT, correct BIGINT)
LANGUAGE sql AS $$
  WITH latest AS (
    SELECT DISTINCT ON (q.student_id, q.lab_id, q.question_idx)
           q.student_id, q.lab_id, q.correct
    FROM empira_quiz_answers q
    JOIN empira_enrollments e ON e.student_id = q.student_id AND e.class_id = p_class
    WHERE exists (SELECT 1 FROM empira_classes c WHERE c.id = p_class AND c.teacher_id = p_uid)
    ORDER BY q.student_id, q.lab_id, q.question_idx, q.created_at DESC
  )
  SELECT l.student_id,
         coalesce(nullif(btrim(p.full_name), ''), p.username, 'O''quvchi'),
         count(DISTINCT l.lab_id), count(*), count(*) FILTER (WHERE l.correct)
  FROM latest l
  LEFT JOIN profiles p ON p.id = l.student_id
  GROUP BY l.student_id, p.full_name, p.username
  ORDER BY 2;
$$;

-- Save/replace a presentation (teachers/admins only; role checked in-function).
CREATE OR REPLACE FUNCTION empira_save_presentation(p_uid UUID, p_slug TEXT, p_grade INT, p_title TEXT, p_slides JSONB)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE r TEXT;
BEGIN
  IF p_uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF jsonb_typeof(p_slides) <> 'array' OR octet_length(p_slides::text) > 60000 THEN RAISE EXCEPTION 'bad slides'; END IF;
  SELECT role INTO r FROM profiles WHERE id = p_uid;
  IF r IS DISTINCT FROM 'teacher' AND r IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'teachers only'; END IF;
  INSERT INTO empira_presentations(topic_slug, grade, title, slides, updated_by, updated_at)
    VALUES (p_slug, p_grade, left(p_title, 120), p_slides, p_uid, now())
  ON CONFLICT (topic_slug, grade) DO UPDATE
    SET title = excluded.title, slides = excluded.slides, updated_by = p_uid, updated_at = now();
END $$;

-- ============================================================================
-- Grants (empira_app owns/uses everything)
-- ============================================================================
GRANT ALL ON ALL TABLES    IN SCHEMA public TO empira_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO empira_app;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO empira_app;
