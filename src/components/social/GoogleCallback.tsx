import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { handleGoogleLogin } from '@/services/googleAuthService';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/services/api';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setIsAuthenticated } = useAuth();
  const hasProcessed = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processGoogleLogin = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      try {
        console.log('GoogleCallback: Processing with params:', searchParams.toString());
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No token received in callback');
        }

        setIsLoading(true);
        const result = await handleGoogleLogin(token);
        console.log('GoogleCallback: Login success:', result);

        if (!result?.token || !result?.user) {
          throw new Error('Invalid response from Google login');
        }

        const { token, user } = result;

        // Verify user with /users/current
        const response = await api.get('/users/current', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data.id) {
          throw new Error('Failed to verify user');
        }

        const verifiedUser = {
          id: response.data.id,
          username: response.data.username,
          firstname: response.data.firstname,
          lastname: response.data.lastname || response.data.firstname,
          email: response.data.email,
          avatar: response.data.avatar,
        };

        // Update AuthProvider state
        setUser(verifiedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(verifiedUser));

        toast({
          title: 'Success',
          description: 'Signed in with Google successfully!',
        });

        console.log('GoogleCallback: Navigating to /onboarding');
        navigate('/onboarding', { replace: true });
      } catch (error: any) {
        console.error('GoogleCallback: Login failed:', error);
        setError(error.message || 'An error occurred during during sign-in');
        toast({
          title: 'Google Sign-In Failed',
          description: error.message || 'An error occurred during sign-in',
          variant: 'destructive',
        });

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);

        console.log('GoogleCallback: Navigating to /signin');
        navigate('/signin', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    if (!setUser || !setIsAuthenticated || !toast) {
      console.error('GoogleCallback: Missing required hooks', { setUser, setIsAuthenticated, toast });
      setError('Authentication system not initialized');
      setIsLoading(false);
      toast({
        title: 'Authentication Error',
        description: 'Authentication system not initialized',
        variant: 'destructive',
      });
      navigate('/signin', { replace: true });
      return;
    }

    processGoogleLogin();
  }, [searchParams, navigate, toast, setUser, setIsAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {isLoading ? (
        <>
          <p className="text-lg font-medium mb-4">Signing you in with Google...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </>
      ) : error ? (
        <>
          <p className="text-lg font-medium text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/signin', { replace: true })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Sign In
          </button>
        </>
      ) : (
        <p className="text-lg font-medium">Redirecting...</p>
      )}
    </div>
  );
};

export default GoogleCallback;
