import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface RoleBasedComponentProps {
  allowedRoles: Array<'admin' | 'teacher' | 'student' | 'user'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  allowedRoles,
  children,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
