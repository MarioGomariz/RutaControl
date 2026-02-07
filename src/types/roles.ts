// =========================
// Tabla: Roles
// =========================
export interface Role {
    id: number;
    rol: string; // 'admin' | 'chofer' | 'analista' | 'logistico'
}

// Constantes de roles
export const ROLES = {
    ADMIN: 1,
    CHOFER: 2,
    ANALISTA: 3,
    LOGISTICO: 4
} as const;

// Nombres de roles para UI
export const ROLE_NAMES: Record<number, string> = {
    1: 'Administrador',
    2: 'Chofer',
    3: 'Analista',
    4: 'Logístico'
};