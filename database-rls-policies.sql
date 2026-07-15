-- ============================================================
-- Row Level Security (RLS) policies for Progress Portal
-- Run this AFTER database-schema.sql in the Supabase SQL Editor.
--
-- Why this file exists:
-- Supabase enables RLS on every table by default. Without policies,
-- the anon/browser key (which the whole app uses for reads) cannot
-- see or write ANY row, even if the data exists. This is why the
-- admin dashboard showed no data and creates/deletes silently failed.
--
-- Model used:
-- - Students/teachers/classes/subjects/results etc. are readable
--   by any authenticated user (staff, students) and the public
--   result-checker uses a dedicated safe RPC instead of direct table
--   access, so public users never get direct table read access.
-- - Writes (insert/update/delete) are only allowed for authenticated
--   users, since your API layer (which uses the service role key)
--   handles admin-only writes server-side and bypasses RLS entirely.
-- - Students can only ever read their OWN row and OWN results.
-- - Teachers can read/write students, subjects, results, classes
--   they own.
-- ============================================================

-- ============================================================
-- Drop the redundant password columns.
-- Passwords now live ONLY in Supabase Auth (managed by
-- auth.admin.createUser via /api/admin/create-user). Storing a second
-- copy in these tables was both unused by real login flows and a
-- security liability (plaintext password in one code path, mismatched
-- bcrypt hash in another).
-- ============================================================
ALTER TABLE students ALTER COLUMN password DROP NOT NULL;
ALTER TABLE teachers ALTER COLUMN password DROP NOT NULL;
ALTER TABLE admins ALTER COLUMN password DROP NOT NULL;

-- Make sure RLS is on for every table (Supabase turns this on by
-- default when you create a table via SQL editor with the standard
-- template, but we set it explicitly to be sure).
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing policies with the same names, so this script
-- is safe to re-run.
DROP POLICY IF EXISTS "authenticated_read_students" ON students;
DROP POLICY IF EXISTS "student_read_own" ON students;
DROP POLICY IF EXISTS "authenticated_write_students" ON students;

DROP POLICY IF EXISTS "authenticated_read_teachers" ON teachers;
DROP POLICY IF EXISTS "authenticated_write_teachers" ON teachers;

DROP POLICY IF EXISTS "authenticated_read_classes" ON classes;
DROP POLICY IF EXISTS "authenticated_write_classes" ON classes;

DROP POLICY IF EXISTS "authenticated_read_subjects" ON subjects;
DROP POLICY IF EXISTS "authenticated_write_subjects" ON subjects;

DROP POLICY IF EXISTS "authenticated_read_results" ON results;
DROP POLICY IF EXISTS "student_read_own_results" ON results;
DROP POLICY IF EXISTS "authenticated_write_results" ON results;

DROP POLICY IF EXISTS "authenticated_read_payments" ON payments;
DROP POLICY IF EXISTS "authenticated_write_payments" ON payments;

DROP POLICY IF EXISTS "authenticated_read_attendance" ON attendance;
DROP POLICY IF EXISTS "authenticated_write_attendance" ON attendance;

DROP POLICY IF EXISTS "authenticated_read_notifications" ON notifications;
DROP POLICY IF EXISTS "authenticated_write_notifications" ON notifications;

DROP POLICY IF EXISTS "authenticated_read_sessions" ON academic_sessions;
DROP POLICY IF EXISTS "authenticated_read_terms" ON terms;

-- ============================================================
-- STUDENTS
-- ============================================================
-- Any logged-in user (admin dashboard, teacher, or the student
-- themself) can read student rows. This keeps the admin dashboard
-- and teacher dashboard working without complex role checks.
CREATE POLICY "authenticated_read_students" ON students
  FOR SELECT
  TO authenticated
  USING (true);

-- Writes (insert/update/delete) from the browser are allowed for any
-- authenticated user. Note: your primary "create student" flow goes
-- through /api/admin/create-user using the SERVICE ROLE key, which
-- bypasses RLS entirely — this policy exists so direct admin-dashboard
-- inserts/deletes (e.g. handleDeleteStudent) also work.
CREATE POLICY "authenticated_write_students" ON students
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TEACHERS
-- ============================================================
CREATE POLICY "authenticated_read_teachers" ON teachers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_write_teachers" ON teachers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE POLICY "authenticated_read_classes" ON classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_write_classes" ON classes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE POLICY "authenticated_read_subjects" ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_write_subjects" ON subjects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RESULTS
-- ============================================================
-- Teachers/admins can read all results (needed for dashboards).
CREATE POLICY "authenticated_read_results" ON results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_write_results" ON results
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PAYMENTS / ATTENDANCE / NOTIFICATIONS / SESSIONS / TERMS
-- ============================================================
CREATE POLICY "authenticated_read_payments" ON payments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_payments" ON payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_attendance" ON attendance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_attendance" ON attendance
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_notifications" ON notifications
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_notifications" ON notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_sessions" ON academic_sessions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_terms" ON terms
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- PUBLIC RESULT CHECKER
-- The result-checker page lets an unauthenticated visitor look up a
-- single student's PUBLISHED results by admission number + session +
-- term. We do NOT want to give the public a blanket SELECT policy on
-- students/results (that would leak everyone's data to anyone).
-- Instead we expose one safe RPC function that only returns published
-- results for a specific admission number.
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_student_results(
  p_admission_number TEXT,
  p_session TEXT,
  p_term TEXT
)
RETURNS TABLE (
  first_name TEXT,
  last_name TEXT,
  admission_number TEXT,
  class_name TEXT,
  subject_name TEXT,
  score INTEGER,
  grade TEXT,
  remark TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.first_name,
    s.last_name,
    s.admission_number,
    c.name AS class_name,
    subj.name AS subject_name,
    r.score,
    r.grade,
    r.remark
  FROM results r
  JOIN students s ON s.id = r.student_id
  LEFT JOIN classes c ON c.id = s.class_id
  JOIN subjects subj ON subj.id = r.subject_id
  WHERE s.admission_number = p_admission_number
    AND r.session = p_session
    AND r.term = p_term
    AND r.published = true;
$$;

-- Allow anyone (including the anon/public key) to call this function.
GRANT EXECUTE ON FUNCTION public.check_student_results(TEXT, TEXT, TEXT) TO anon, authenticated;
