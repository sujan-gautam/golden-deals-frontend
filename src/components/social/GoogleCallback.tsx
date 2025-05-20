import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { handleGoogleLogin } from '@/services/googleAuthService';
import { useAuth } from './use-auth';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processGoogleLogin = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      try {
        console.log('GoogleCallback reached with params:', searchParams.toString());
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No token received in callback');
        }

        setIsLoading(true);
        const result = await handleGoogleLogin(token);
        console.log('Google login success:', result);

        // Update auth state and store token
        setUser(result.user);
        localStorage.setItem('token', result.accesstoken);

        toast({
          title: 'Success',
          description: 'Signed in with Google successfully!',
        });

        console.log('Navigating to /onboarding');
        navigate('/onboarding', { replace: true });
      } catch (error: any) {
        console.error('Google login failed:', error);
        toast({
          title: 'Google Sign-In Failed',
          description: error.message || 'An error occurred during sign-in',
          variant: 'destructive',
        });
        console.log('Navigating to /signin');
        navigate('/signin', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    processGoogleLogin();
  }, [searchParams, navigate, toast, setUser]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg font-medium mb-4">
        {isLoading ? 'Signing you in with Google...' : 'Processing...'}
      </p>
      {isLoading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      )}
      <button
        onClick={() => navigate('/onboarding', { replace: true })}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Debug: Go to Onboarding
      </button>
    </div>
  );
};

export default GoogleCallback;
