import { LoginFormData, SignupFormData, FormErrors } from '../types/auth';

export const validateForm = (formData: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!formData.password.trim()) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  // Role validation
  if (!formData.role) {
    errors.role = 'Please select your role';
  }

  return errors;
};

export const validateSignupForm = (formData: SignupFormData): FormErrors => {
  const errors: FormErrors = {};

  // Full name validation
  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters long';
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!formData.password.trim()) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }

  // Confirm password validation
  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Role validation
  if (!formData.role) {
    errors.role = 'Please select your role';
  }

  // Role-specific validations
  if (formData.role === 'faculty' || formData.role === 'administrator') {
    if (!formData.employeeId?.trim()) {
      errors.employeeId = 'Employee ID is required for faculty and administrators';
    }
  }

  if (formData.role === 'student') {
    if (!formData.studentId?.trim()) {
      errors.studentId = 'Student ID is required for students';
    }
  }

  // Phone validation (optional)
  if (formData.phone && formData.phone.trim()) {
    if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
  }

  return errors;
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};