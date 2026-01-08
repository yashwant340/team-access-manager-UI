import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: string[]; // optional role restriction
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.platformRole)) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

export default PrivateRoute;
