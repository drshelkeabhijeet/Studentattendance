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
  role?: string;
  general?: string;
}