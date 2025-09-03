// src/routes/guards/RoleGuard.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Role = 'admin' | 'teacher' | 'student' | 'user';

interface Props {
  allow?: Role[];
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


  // Only enforce role check if an allow list was provided
  if (allow && !allow.includes(user.role as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
