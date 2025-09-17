import { useState } from 'react';
import { LoginFormData, FormErrors } from '../types/auth';
import { validateForm } from '../utils/validation';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useAuth = () => {
  const { user, profile, loading: authLoading, signIn, signOut } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (formData: LoginFormData): Promise<{ success: boolean; errors?: FormErrors }> => {
    setIsLoading(true);

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setIsLoading(false);
      return { success: false, errors: validationErrors };
    }

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setIsLoading(false);
        return { 
          success: false, 
          errors: { 
            general: error.message === 'Email not confirmed' 
              ? 'Please check your email and click the verification link before signing in.'
              : 'Invalid email or password. Please check your credentials and try again.' 
          }
        };
      }

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
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
    isLoading: isLoading || authLoading,
    login,
    logout
  };
};