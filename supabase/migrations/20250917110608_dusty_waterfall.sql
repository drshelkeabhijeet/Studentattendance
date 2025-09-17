/*
  # Student Attendance Management System Database Schema

  1. New Tables
    - `profiles` - Extended user profiles with university-specific information
      - `id` (uuid, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (enum: administrator, faculty, student)
      - `employee_id` (text, for faculty/admin)
      - `student_id` (text, for students)
      - `department` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `courses` - Academic courses
      - `id` (uuid, primary key)
      - `course_code` (text, unique)
      - `course_name` (text)
      - `department` (text)
      - `semester` (integer)
      - `academic_year` (text)
      - `faculty_id` (uuid, references profiles)
      - `credits` (integer)
      - `created_at` (timestamp)

    - `enrollments` - Student course enrollments
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `enrollment_date` (timestamp)
      - `status` (enum: active, dropped, completed)

    - `attendance_sessions` - Class sessions
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `faculty_id` (uuid, references profiles)
      - `session_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `session_type` (enum: lecture, practical, tutorial)
      - `topic` (text)
      - `created_at` (timestamp)

    - `attendance_records` - Individual attendance records
      - `id` (uuid, primary key)
      - `session_id` (uuid, references attendance_sessions)
      - `student_id` (uuid, references profiles)
      - `status` (enum: present, absent, late)
      - `marked_at` (timestamp)
      - `marked_by` (uuid, references profiles)
      - `notes` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Students can only view their own data
    - Faculty can manage their courses and students
    - Administrators have full access

  3. Functions and Triggers
    - Auto-update timestamps
    - Calculate attendance percentages
    - Validate enrollment constraints
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('administrator', 'faculty', 'student');
CREATE TYPE enrollment_status AS ENUM ('active', 'dropped', 'completed');
CREATE TYPE session_type AS ENUM ('lecture', 'practical', 'tutorial');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  employee_id text,
  student_id text,
  department text NOT NULL DEFAULT 'Management Science',
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_employee_id CHECK (
    (role IN ('administrator', 'faculty') AND employee_id IS NOT NULL) OR 
    (role = 'student')
  ),
  CONSTRAINT valid_student_id CHECK (
    (role = 'student' AND student_id IS NOT NULL) OR 
    (role IN ('administrator', 'faculty'))
  ),
  CONSTRAINT unique_employee_id UNIQUE (employee_id),
  CONSTRAINT unique_student_id UNIQUE (student_id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text UNIQUE NOT NULL,
  course_name text NOT NULL,
  department text NOT NULL DEFAULT 'Management Science',
  semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
  academic_year text NOT NULL,
  faculty_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  credits integer NOT NULL DEFAULT 3 CHECK (credits BETWEEN 1 AND 6),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date timestamptz DEFAULT now(),
  status enrollment_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate enrollments
  UNIQUE(student_id, course_id)
);

-- Create attendance_sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  session_type session_type DEFAULT 'lecture',
  topic text,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure end time is after start time
  CONSTRAINT valid_session_time CHECK (end_time > start_time)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'absent',
  marked_at timestamptz DEFAULT now(),
  marked_by uuid REFERENCES profiles(id),
  notes text,
  
  -- Prevent duplicate attendance records
  UNIQUE(session_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course ON attendance_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON attendance_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Administrators can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

CREATE POLICY "Faculty can view student profiles in their courses"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'student' AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN courses c ON c.faculty_id = p.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE p.id = auth.uid() AND p.role = 'faculty' AND e.student_id = profiles.id
    )
  );

-- RLS Policies for courses
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Faculty can manage their courses"
  ON courses FOR ALL
  TO authenticated
  USING (faculty_id = auth.uid());

CREATE POLICY "Administrators can manage all courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Students can view their enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Faculty can view enrollments in their courses"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      JOIN profiles p ON p.id = c.faculty_id
      WHERE c.id = enrollments.course_id AND p.id = auth.uid() AND p.role = 'faculty'
    )
  );

CREATE POLICY "Administrators can manage all enrollments"
  ON enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

-- RLS Policies for attendance_sessions
CREATE POLICY "Students can view sessions for their enrolled courses"
  ON attendance_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = attendance_sessions.course_id AND e.student_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can manage sessions for their courses"
  ON attendance_sessions FOR ALL
  TO authenticated
  USING (faculty_id = auth.uid());

CREATE POLICY "Administrators can manage all sessions"
  ON attendance_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

-- RLS Policies for attendance_records
CREATE POLICY "Students can view their attendance records"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Faculty can manage attendance for their sessions"
  ON attendance_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM attendance_sessions s
      WHERE s.id = attendance_records.session_id AND s.faculty_id = auth.uid()
    )
  );

CREATE POLICY "Administrators can manage all attendance records"
  ON attendance_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate attendance percentage
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
  p_student_id uuid,
  p_course_id uuid DEFAULT NULL
)
RETURNS numeric AS $$
DECLARE
  total_sessions integer;
  attended_sessions integer;
BEGIN
  -- Count total sessions
  SELECT COUNT(*)
  INTO total_sessions
  FROM attendance_sessions s
  LEFT JOIN attendance_records r ON r.session_id = s.id AND r.student_id = p_student_id
  WHERE (p_course_id IS NULL OR s.course_id = p_course_id)
  AND EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.student_id = p_student_id AND e.course_id = s.course_id
  );

  -- Count attended sessions (present or late)
  SELECT COUNT(*)
  INTO attended_sessions
  FROM attendance_sessions s
  JOIN attendance_records r ON r.session_id = s.id
  WHERE r.student_id = p_student_id
  AND r.status IN ('present', 'late')
  AND (p_course_id IS NULL OR s.course_id = p_course_id);

  -- Calculate percentage
  IF total_sessions = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((attended_sessions::numeric / total_sessions::numeric) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;