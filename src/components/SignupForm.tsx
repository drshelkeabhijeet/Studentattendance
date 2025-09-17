import React, { useState } from 'react';
import { SignupFormData, FormErrors, UserRole } from '../types/auth';
import { validateSignupForm } from '../utils/validation';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import UniversityLogo from './UniversityLogo';
import RoleSelector from './RoleSelector';
import InputField from './InputField';
import { AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

interface SignupFormProps {
  onBackToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onBackToLogin }) => {
  const { signUp } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student',
    employeeId: '',
    studentId: '',
    department: 'Management Science',
    phone: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate form
    const validationErrors = validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        role: formData.role,
        employee_id: formData.employeeId || undefined,
        student_id: formData.studentId || undefined,
        department: formData.department,
        phone: formData.phone || undefined,
      });

      if (error) {
        setErrors({ 
          general: error.message === 'User already registered' 
            ? 'This email address is already registered. Please try logging in or use a different email.'
            : error.message || 'An error occurred during registration. Please try again.'
        });
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'student',
      employeeId: '',
      studentId: '',
      department: 'Management Science',
      phone: ''
    });
    setErrors({});
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-white text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Registration Successful!</h1>
              <p className="text-green-100 text-sm">Your account has been created successfully.</p>
            </div>
            
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Please check your email for a verification link to activate your account.
              </p>
              <button
                onClick={onBackToLogin}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6 text-white text-center">
            <UniversityLogo />
            <h1 className="text-xl font-bold mb-2">
              Dr. Babasaheb Ambedkar Marathwada University
            </h1>
            <p className="text-teal-100 text-sm font-medium">
              Department of Management Science
            </p>
            <p className="text-teal-200 text-xs mt-1">
              Create New Account
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Register</h2>
              <p className="text-gray-600 text-sm">Create your university account</p>
            </div>

            {/* Error Alert */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Registration Failed</p>
                  <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <InputField
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(fullName) => setFormData({ ...formData, fullName })}
                error={errors.fullName}
              />

              {/* Role Selection */}
              <RoleSelector
                value={formData.role}
                onChange={(role: UserRole) => setFormData({ ...formData, role })}
                error={errors.role}
              />

              {/* Conditional ID Fields */}
              {(formData.role === 'faculty' || formData.role === 'administrator') && (
                <InputField
                  type="text"
                  label="Employee ID"
                  placeholder="Enter your employee ID"
                  value={formData.employeeId || ''}
                  onChange={(employeeId) => setFormData({ ...formData, employeeId })}
                  error={errors.employeeId}
                />
              )}

              {formData.role === 'student' && (
                <InputField
                  type="text"
                  label="Student ID"
                  placeholder="Enter your student ID"
                  value={formData.studentId || ''}
                  onChange={(studentId) => setFormData({ ...formData, studentId })}
                  error={errors.studentId}
                />
              )}

              {/* Email Field */}
              <InputField
                type="email"
                label="Email Address"
                placeholder="Enter your university email"
                value={formData.email}
                onChange={(email) => setFormData({ ...formData, email })}
                error={errors.email}
              />

              {/* Phone Field */}
              <InputField
                type="text"
                label="Phone Number (Optional)"
                placeholder="Enter your phone number"
                value={formData.phone || ''}
                onChange={(phone) => setFormData({ ...formData, phone })}
                error={errors.phone}
              />

              {/* Password Field */}
              <InputField
                type="password"
                label="Password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(password) => setFormData({ ...formData, password })}
                error={errors.password}
              />

              {/* Confirm Password Field */}
              <InputField
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(confirmPassword) => setFormData({ ...formData, confirmPassword })}
                error={errors.confirmPassword}
              />

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>

                <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                  >
                    Clear Form
                  </button>
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="flex items-center space-x-1 text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>© 2025 Dr. Babasaheb Ambedkar Marathwada University</p>
          <p className="mt-1">Department of Management Science - All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;