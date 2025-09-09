// Barrel exports for types across the app
// Note: We do NOT modify existing type definitions; we only re-export and provide aliases for compatibility.

export * from './chofer';
export * from './destino';
export * from './roles';
export * from './semirremolque';
export * from './servicio';
export * from './tractor';
export * from './usuario';
export * from './viaje';

// Backward-compatible aliases (old names -> new structured types)
import type { Usuario } from './usuario';
export type User = Usuario;
export type UserWithPassword = Omit<Usuario, 'id'>;
