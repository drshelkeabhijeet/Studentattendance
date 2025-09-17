import { User } from '../types/auth';

export const sampleUsers: User[] = [
  {
    email: 'admin@bamu.ac.in',
    password: 'admin123',
    role: 'administrator',
    name: 'Dr. Priya Sharma'
  },
  {
    email: 'suresh.patil@bamu.ac.in',
    password: 'faculty123',
    role: 'faculty',
    name: 'Prof. Suresh Patil'
  },
  {
    email: 'rahul.sharma@student.bamu.ac.in',
    password: 'student123',
    role: 'student',
    name: 'Rahul Sharma'
  }
];