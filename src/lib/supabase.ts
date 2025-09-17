import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'administrator' | 'faculty' | 'student';
  employee_id?: string;
  student_id?: string;
  department: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  department: string;
  semester: number;
  academic_year: string;
  faculty_id?: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrollment_date: string;
  status: 'active' | 'dropped' | 'completed';
  created_at: string;
}

export interface AttendanceSession {
  id: string;
  course_id: string;
  faculty_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: 'lecture' | 'practical' | 'tutorial';
  topic?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'late';
  marked_at: string;
  marked_by?: string;
  notes?: string;
}

export interface AttendanceSummary {
  student_id: string;
  student_name: string;
  student_number: string;
  course_id: string;
  course_code: string;
  course_name: string;
  total_sessions: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  attendance_percentage: number;
}