// =========================
// Tabla: Roles
// =========================
export interface Role {
  id: number;
  rol: string; // 'admin' | 'chofer'
}

// =========================
// Tabla: Usuario
// =========================
export interface Usuario {
  id: number;
  usuario: string;       // email
  contrasena: string;    // hash
  rol_id: number;        // FK → Role.id
  activo: boolean;
}

// =========================
// Tabla: Chofer
// =========================
export interface Chofer {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email: string;
  licencia?: string;
  fecha_vencimiento_licencia: string; // Date en formato ISO
  activo: boolean;
}

// =========================
// Tabla: Semirremolque
// =========================
export type EstadoUnidad = 'disponible' | 'en uso' | 'en reparacion' | 'fuera de servicio';

export interface Semirremolque {
  id: number;
  nombre: string;
  dominio: string;
  anio: number;
  estado: EstadoUnidad;
  tipo_servicio?: string;
  alcance_servicio?: string;
  vencimiento_rto?: string;
  vencimiento_visual_externa?: string;
  vencimiento_visual_interna?: string;
  vencimiento_espesores?: string;
  vencimiento_prueba_hidraulica?: string;
  vencimiento_mangueras?: string;
  vencimiento_valvula_flujo?: string;
}

// =========================
// Tabla: Tractores
// =========================
export interface Tractor {
  id: number;
  marca: string;
  modelo: string;
  dominio: string;
  anio: number;
  vencimiento_rto?: string;
  estado: EstadoUnidad;
  tipo_servicio?: string;
  alcance_servicio?: string;
}

// =========================
// Tabla: Servicios
// =========================
export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  requiere_prueba_hidraulica: boolean;
  requiere_visuales: boolean;
  requiere_valvula_y_mangueras: boolean;
}

// =========================
// Tabla: Viaje
// =========================
export type EstadoViaje = 'programado' | 'en curso' | 'finalizado';

export interface Viaje {
  id: number;
  chofer_id: number;         // FK → Chofer.id
  tractor_id: number;        // FK → Tractor.id
  semirremolque_id: number;  // FK → Semirremolque.id
  servicio_id: number;       // FK → Servicio.id
  origen: string;
  cantidad_destinos: number;
  fecha_salida: string;      // Date en ISO
  estado: EstadoViaje;
}

// =========================
// Tabla: Destinos
// =========================
export interface Destino {
  id: number;
  ubicacion: string;
  viaje_id: number;          // FK → Viaje.id
  orden: number;
}
