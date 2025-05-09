import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { handleGoogleLogin } from '@/services/googleAuthService';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const hasProcessed = useRef(false); // Prevent multiple executions

  useEffect(() => {
    if (hasProcessed.current) return;

    hasProcessed.current = true;
    console.log('GoogleCallback reached with params:', searchParams.toString());

    const token = searchParams.get('token');
    if (token) {
      handleGoogleLogin(token)
        .then((result) => {
          console.log('Google login success:', result);
          toast({
            title: 'Success',
            description: 'Signed in with Google successfully!',
          });
          // SPA-friendly redirect (instead of full reload)
          navigate('/onboarding', { replace: true });
        })
        .catch((error) => {
          console.error('Google login failed:', error);
          toast({
            title: 'Google Sign-In Failed',
            description: error.message,
            variant: 'destructive',
          });
          navigate('/signin', { replace: true });
        });
    } else {
      console.error('No token received in callback');
      toast({
        title: 'Google Sign-In Failed',
        description: 'No token received.',
        variant: 'destructive',
      });
      navigate('/signin', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">Signing you in with Google...</p>
    </div>
  );
};

export default GoogleCallback;
