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
<<<<<<< HEAD
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
=======
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://golden-deals-backend-production.up.railway.app/'}/api/auth/google`;
>>>>>>> fb14da5be794e91299c308cc6ce4ac425e915d51
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
