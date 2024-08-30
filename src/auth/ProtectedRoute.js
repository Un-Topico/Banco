import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContex';
export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}
