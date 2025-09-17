import { useState } from 'react';
import { LoginFormData, FormErrors } from '../types/auth';
import { validateForm } from '../utils/validation';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useAuth = () => {
  const { user, profile, loading: authLoading, signIn, signOut } = useSupabaseAuth();
  const [loginLoading, setLoginLoading] = useState(false);

  const login = async (formData: LoginFormData): Promise<{ success: boolean; errors?: FormErrors }> => {
    // Validate form first
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      return { success: false, errors: validationErrors };
    }

    setLoginLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        let errorMessage = 'An error occurred during login. Please try again.';
        
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
        
        setLoginLoading(false);
        return { 
          success: false, 
          errors: { general: errorMessage }
        };
      }

      // Success - don't set loading to false here, let auth state handle it
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setLoginLoading(false);
      return { 
        success: false, 
        errors: { 
          general: 'An error occurred during login. Please try again.' 
        }
      };
    }
  };

  const logout = async () => {
    await signOut();
  };

  return {
    user: profile,
    isLoading: loginLoading || authLoading,
    login,
    logout
  };
};