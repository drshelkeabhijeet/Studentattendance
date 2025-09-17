export interface User {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export type UserRole = 'administrator' | 'faculty' | 'student';

export interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
}

export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  employeeId?: string;
  studentId?: string;
  phone?: string;
  role?: string;
  general?: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: UserRole;
  employeeId?: string;
  studentId?: string;
  department: string;
  phone?: string;
}