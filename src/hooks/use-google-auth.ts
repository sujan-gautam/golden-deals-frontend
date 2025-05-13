import { useAuth } from './use-auth';
import { googleSignOut } from '../services/googleAuthService';
import { useToast } from '../components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface GoogleAuthType {
  googleLogin: () => void;
  googleLogout: () => void;
}

export const useGoogleAuth = (): GoogleAuthType => {
  const { toast } = useToast();
  const navigate = useNavigate();

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