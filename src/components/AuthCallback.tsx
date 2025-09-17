import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          navigate('/');
        } else {
          // No session, redirect to login with success message
          navigate('/?confirmed=true');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
        <p className="text-gray-600">Confirming your email...</p>
      </div>
    </div>
  );
};

export default AuthCallback;