import { useAuth } from './use-auth';
import { googleSignOut } from '../services/googleAuthService';
import { useToast } from '../components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface GoogleAuthType {
  googleLogin: () => void;
  googleLogout: () => void;
}

export const useGoogleAuth = (): GoogleAuthType => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('useGoogleAuth: isAuthenticated=', isAuthenticated, 'user=', user, 'location=', location.pathname);
    if ((isAuthenticated || user) && location.pathname !== '/onboarding') {
      console.log('Navigating to /onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const googleLogout = () => {
    googleSignOut();
    navigate('/signin');
    toast({
      title: 'Signed out',
      description: 'You have been signed out from Google.',
    });
  };

  return { googleLogin, googleLogout };
};
