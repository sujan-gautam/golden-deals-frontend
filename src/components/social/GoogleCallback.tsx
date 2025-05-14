import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { handleGoogleLogin } from '@/services/googleAuthService';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
        toast({
          title: 'Success',
          description: 'Signed in with Google successfully!',
        });

        console.log('Navigating to /onboarding'); // Debug navigation
        navigate('/onboarding', { replace: true });
      } catch (error: any) {
        console.error('Google login failed:', error);
        toast({
          title: 'Google Sign-In Failed',
          description: error.message || 'An error occurred during sign-in',
          variant: 'destructive',
        });
        console.log('Navigating to /signin'); // Debug navigation
        navigate('/signin', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    processGoogleLogin();
  }, [searchParams, navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg font-medium mb-4">
        {isLoading ? 'Signing you in with Google...' : 'Processing...'}
      </p>
      {isLoading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      )}
    </div>
  );
};

export default GoogleCallback;