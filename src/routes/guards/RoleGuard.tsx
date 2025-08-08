// src/routes/guards/RoleGuard.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props { 
  allow?: Array<'admin' | 'teacher' | 'student'| 'user'>; 
}

export const RoleGuard = ({ allow }: Props) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-spinner">Loading session...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if (!allow.includes(user.role)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }


    // If allow prop is provided, perform role checking
  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
