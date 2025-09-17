import React, { useState } from 'react';
import { useEffect } from 'react';
import { LoginFormData, FormErrors, UserRole } from './types/auth';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import UniversityLogo from './components/UniversityLogo';
import RoleSelector from './components/RoleSelector';
import InputField from './components/InputField';
import Dashboard from './components/Dashboard';
import SignupForm from './components/SignupForm';
import { AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const { user, isLoading: authLoading, login, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'student'
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    // Handle email confirmation callback
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fragment = window.location.hash.substring(1);
      const fragmentParams = new URLSearchParams(fragment);
      
      // Check for confirmation success
      if (fragmentParams.get('type') === 'signup') {
        setConfirmationMessage('Email confirmed successfully! You can now sign in with your credentials.');
        // Clear the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Check for errors
      const error = fragmentParams.get('error');
      const errorDescription = fragmentParams.get('error_description');
      
      if (error) {
        console.error('Auth callback error:', error, errorDescription);
        setErrors({ 
          general: errorDescription ? 
            decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : 
            'An error occurred during email confirmation. Please try again.'
        });
        // Clear the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleAuthCallback();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setConfirmationMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(formData);
      
      if (!result.success && result.errors) {
        setErrors(result.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ email: '', password: '', role: 'student' });
    setErrors({});
    setConfirmationMessage(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  if (showSignup) {
    return <SignupForm onBackToLogin={() => setShowSignup(false)} />;
  }

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
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
              Student Attendance Management System
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600 text-sm">Please sign in with your account</p>
            </div>

            {/* Confirmation Message */}
            {confirmationMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-800 text-sm font-medium">Email Confirmed!</p>
                  <p className="text-green-700 text-sm mt-1">{confirmationMessage}</p>
                </div>
              </div>
            )}
            {/* Error Alert */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Authentication Failed</p>
                  <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <RoleSelector
                value={formData.role}
                onChange={(role: UserRole) => setFormData({ ...formData, role })}
                error={errors.role}
              />

              {/* Email Field */}
              <InputField
                type="email"
                label="Email Address"
                placeholder="Enter your university email"
                value={formData.email}
                onChange={(email) => setFormData({ ...formData, email })}
                error={errors.email}
              />

              {/* Password Field */}
              <InputField
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(password) => setFormData({ ...formData, password })}
                error={errors.password}
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
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
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
                    className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setShowSignup(true)}
                      className="text-teal-600 hover:text-teal-700 font-semibold transition-colors duration-200"
                    >
                      Create Account
                    </button>
                  </p>
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
}

export default App;