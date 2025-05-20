import { useAuth } from './use-auth';
import { googleSignOut } from '../services/googleAuthService';
import { useToast } from '../components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react'; // Add useEffect to handle post-login navigation

interface GoogleAuthType {
  googleLogin: () => void;
  googleLogout: () => void;
}

export const useGoogleAuth = (): GoogleAuthType => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Assume useAuth provides user or isAuthenticated

  // Handle navigation after successful login
  useEffect(() => {
    if (isAuthenticated || user) {
      navigate('/onboarding');
    }
  }, [isAuthenticated, user, navigate]);

  const googleLogin = () => {
    // Redirect to Google OAuth, handled by GoogleAuthButton
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
