import { createClient } from '@supabase/supabase-js';

// Obtenemos las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de Supabase
export type Tables = {
  users: User;
  roles: Role;
  choferes: Chofer;
  semirremolques: Semirremolque;
  tractores: Tractor;
  servicios: Servicio;
};

// Tipos para las relaciones y joins
export type UserWithRole = User & {
  roles: Role;
};

// Definición de tipos basados en las tablas de la base de datos
export interface User {
  id: string; // UUID en Supabase
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  rol_id: number; // Foreign key a la tabla roles
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
  ultima_conexion: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Interfaz extendida para incluir la contraseña en la creación de usuarios
export interface UserWithPassword extends Omit<User, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> {
  contraseña: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Chofer {
  id: string; // UUID en Supabase
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  licencia: string;
  fecha_vencimiento_licencia: string; // Mejor usar Date en la aplicación
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Semirremolque {
  id: string; // UUID en Supabase
  nombre: string;
  dominio: string;
  año: number;
  estado: string;
  tipo_servicio: string;
  alcance_servicio: boolean;
  vencimiento_rto: string;
  vencimiento_visual_ext: string;
  vencimiento_visual_int: string;
  vencimiento_espesores: string;
  vencimiento_prueba_hidraulica: string;
  vencimiento_mangueras: string;
  vencimiento_valvula_five: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Tractor {
  id: string; // UUID en Supabase
  marca: string;
  modelo: string;
  dominio: string;
  año: number;
  vencimiento_rto: string;
  estado: string;
  tipo_servicio: string;
  alcance_servicio: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Servicio {
  id: string; // UUID en Supabase
  nombre: string;
  descripcion: string;
  requierePruebaHidraulica: boolean;
  requiereVisuales: boolean;
  requiereValvulaYMangueras: boolean;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
