import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';
import { hasAnyPermission, type Permission } from '@/utils/permissions';

type Role = 'admin' | 'administrador' | 'chofer' | 'analista' | 'logistico' | 'user';

interface ProtectedRouteProps {
  roles?: Role[];
  permissions?: Permission[];
  requireAll?: boolean; // Si es true, requiere todos los permisos. Si es false, requiere al menos uno
}

// Mapeo de roles string a rol_id
const roleToId: Record<string, number> = {
  'administrador': 1,
  'admin': 1,
  'chofer': 2,
  'analista': 3,
  'logistico': 4,
};

export function ProtectedRoute({ roles, permissions, requireAll = false }: ProtectedRouteProps) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar roles si se especifican
  if (roles && !roles.includes(user.role as Role)) {
    return <Navigate to="/403" replace />;
  }
  
  // Verificar permisos si se especifican
  if (permissions && permissions.length > 0) {
    const rolId = roleToId[user.role] || 0;
    
    if (requireAll) {
      // Requiere todos los permisos
      const hasAll = permissions.every(permission => hasAnyPermission(rolId, [permission]));
      if (!hasAll) {
        return <Navigate to="/403" replace />;
      }
    } else {
      // Requiere al menos uno de los permisos
      if (!hasAnyPermission(rolId, permissions)) {
        return <Navigate to="/403" replace />;
      }
    }
  }
  
  return <Outlet />;
}
