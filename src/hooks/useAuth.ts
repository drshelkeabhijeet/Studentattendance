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
            general: 'Invalid email or password. Please check your credentials and try again.' 
          }
        };
      }

      // Wait for profile to be loaded
      if (data.user) {
        // Give some time for the profile to be fetched
        let attempts = 0;
        while (!profile && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        // Check if user role matches selected role
        if (profile && profile.role !== formData.role) {
          setIsLoading(false);
          return { 
            success: false, 
            errors: { 
              general: `You are not registered as a ${formData.role}. Please select the correct role.` 
            }
          };
        }
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