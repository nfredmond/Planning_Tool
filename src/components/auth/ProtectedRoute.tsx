import React, { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  element: ReactElement;
  requiresAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  requiresAdmin = false 
}) => {
  const { isAuthenticated, isAdmin, setShowLoginModal } = useAuth();
  const location = useLocation();

  // If user is not authenticated, show login modal and navigate to home page
  if (!isAuthenticated) {
    setShowLoginModal(true);
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // If route requires admin access but user is not an admin, navigate to home page
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Otherwise, render the protected component
  return element;
};

export default ProtectedRoute; 