
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import AuthModal from './AuthModal';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, fallback }) => {
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleAuthAction = () => {
    setShowAuthModal(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      {fallback || (
        <div className="rounded-md bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">You need to be signed in to access this feature</p>
          <button
            onClick={handleAuthAction}
            className="text-sm font-medium text-usm-gold hover:underline"
          >
            Sign in or create an account
          </button>
        </div>
      )}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseModal}
        initialTab="signin"
        message="Sign in to access this feature"
      />
    </>
  );
};

export default RequireAuth;
