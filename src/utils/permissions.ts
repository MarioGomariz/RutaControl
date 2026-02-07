import { ROLES } from '@/types/roles';

export type Permission = 
  | 'view_estadisticas'
  | 'view_choferes'
  | 'view_tractores'
  | 'view_semirremolques'
  | 'view_viajes'
  | 'view_usuarios'
  | 'edit_choferes'
  | 'edit_tractores'
  | 'edit_semirremolques'
  | 'edit_viajes'
  | 'edit_usuarios'
  | 'create_choferes'
  | 'create_tractores'
  | 'create_semirremolques'
  | 'create_viajes'
  | 'create_usuarios'
  | 'delete_choferes'
  | 'delete_tractores'
  | 'delete_semirremolques'
  | 'delete_viajes'
  | 'delete_usuarios'
  | 'edit_vencimientos';

// Permisos por rol
const rolePermissions: Record<number, Permission[]> = {
  [ROLES.ADMIN]: [
    'view_estadisticas',
    'view_choferes',
    'view_tractores',
    'view_semirremolques',
    'view_viajes',
    'view_usuarios',
    'edit_choferes',
    'edit_tractores',
    'edit_semirremolques',
    'edit_viajes',
    'edit_usuarios',
    'create_choferes',
    'create_tractores',
    'create_semirremolques',
    'create_viajes',
    'create_usuarios',
    'delete_choferes',
    'delete_tractores',
    'delete_semirremolques',
    'delete_viajes',
    'delete_usuarios',
    'edit_vencimientos',
  ],
  [ROLES.CHOFER]: [
    'view_viajes',
  ],
  [ROLES.ANALISTA]: [
    'view_estadisticas',
  ],
  [ROLES.LOGISTICO]: [
    'view_choferes',
    'view_tractores',
    'view_semirremolques',
    'edit_vencimientos',
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(rolId: number, permission: Permission): boolean {
  const permissions = rolePermissions[rolId] || [];
  return permissions.includes(permission);
}

/**
 * Verifica si un rol tiene alguno de los permisos especificados
 */
export function hasAnyPermission(rolId: number, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(rolId, permission));
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(rolId: number, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(rolId, permission));
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getRolePermissions(rolId: number): Permission[] {
  return rolePermissions[rolId] || [];
}
