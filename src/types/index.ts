// Barrel exports for types across the app
// Note: We do NOT modify existing type definitions; we only re-export and provide aliases for compatibility.

export * from './chofer';
export * from './destino';
export * from './roles';
export * from './servicio';
export * from './usuario';
export * from './viaje';

// Explicit re-exports to avoid name collisions
import type { Semirremolque, EstadoUnidad as EstadoUnidadSemirremolque } from './semirremolque';
import type { Tractor, EstadoUnidad as EstadoUnidadTractor } from './tractor';
export type { Semirremolque, EstadoUnidadSemirremolque, Tractor, EstadoUnidadTractor };

// Backward-compatible aliases (old names -> new structured types)
import type { Usuario } from './usuario';
export type User = Usuario;
export type UserWithPassword = Omit<Usuario, 'id'>;
