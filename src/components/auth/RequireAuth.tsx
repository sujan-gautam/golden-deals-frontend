import React, { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AuthModal from './AuthModal';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectAfterAuth?: string; // Optional redirect path after successful auth
  requireMessage?: string;    // Custom message for the auth requirement
}

const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  fallback,
  redirectAfterAuth = '/feed', // Matches AuthModal's default redirect
  requireMessage = 'You need to be signed in to access this feature',
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  // Handle opening the auth modal
  const handleAuthAction = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // Handle closing the auth modal
  const handleCloseModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="animate-spin h-8 w-8 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-600">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Default fallback UI
  const defaultFallback = (
    <div className="rounded-md bg-gray-50 p-6 text-center max-w-md mx-auto my-8">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2c0 .738.402 1.378 1 1.723V15a1 1 0 001 1h2a1 1 0 001-1v-2.277c.598-.345 1-.985 1-1.723zm9-2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1V5a4 4 0 018 0v2h1a2 2 0 012 2z"
          />
        </svg>
        <p className="text-sm text-gray-600 mb-2">{requireMessage}</p>
        <button
          onClick={handleAuthAction}
          className="inline-flex items-center px-4 py-2 bg-usm-gold hover:bg-amber-600 text-black text-sm font-medium rounded-md transition-colors"
        >
          Sign in or create an account
        </button>
      </div>
    </div>
  );

  return (
    <>
      {fallback || defaultFallback}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseModal}
        initialTab="signin"
        message={requireMessage}
      />
    </>
  );
};

export default RequireAuth;