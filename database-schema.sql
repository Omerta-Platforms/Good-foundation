-- Create database schema for Progress International Group of Schools

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  admission_number TEXT UNIQUE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  passport_url TEXT,
  date_of_birth DATE,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  staff_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  capacity INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F')),
  remark TEXT,
  session TEXT NOT NULL,
  term TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, subject_id, session, term)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT DEFAULT 'all',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Academic Sessions table
CREATE TABLE IF NOT EXISTS academic_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Terms table
CREATE TABLE IF NOT EXISTS terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  session_id UUID REFERENCES academic_sessions(id) ON DELETE CASCADE,
  current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_results_student_id ON results(student_id);
CREATE INDEX idx_results_session_term ON results(session, term);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_attendance_student_id_date ON attendance(student_id, date);
CREATE INDEX idx_notifications_target ON notifications(target);

-- Insert default admin user (password: admin123)
INSERT INTO admins (email, password, first_name, last_name, role)
VALUES (
  'admin@progress.edu',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr7d5Z4xWnZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5', -- admin123 hashed
  'Admin',
  'User',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert default academic session
INSERT INTO academic_sessions (name, start_date, end_date, current)
VALUES (
  '2024/2025',
  '2024-09-01',
  '2025-07-31',
  TRUE
) ON CONFLICT (name) DO NOTHING;

-- Insert default terms
INSERT INTO terms (name, session_id, current)
SELECT 
  'First Term',
  id,
  TRUE
FROM academic_sessions
WHERE current = TRUE
ON CONFLICT DO NOTHING;

INSERT INTO terms (name, session_id, current)
SELECT 
  'Second Term',
  id,
  FALSE
FROM academic_sessions
WHERE current = TRUE
ON CONFLICT DO NOTHING;

INSERT INTO terms (name, session_id, current)
SELECT 
  'Third Term',
  id,
  FALSE
FROM academic_sessions
WHERE current = TRUE
ON CONFLICT DO NOTHING;
