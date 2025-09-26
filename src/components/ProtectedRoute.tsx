import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';

type Role = 'admin' | 'administrador' | 'chofer' | 'user';

interface ProtectedRouteProps {
  roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.role as Role)) {
    // Si se especifican roles y el usuario no tiene ninguno de ellos
    return <Navigate to="/403" replace />;
  }
  
  return <Outlet />;
}
