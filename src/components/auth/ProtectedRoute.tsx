
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Display loading spinner while checking auth status
    return (
      <div className="flex items-center justify-center h-screen bg-choresync-gray">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-choresync-blue mb-4">Loading...</h2>
          <div className="w-16 h-16 border-4 border-t-choresync-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the login page but save the current location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;