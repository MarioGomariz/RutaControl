// =========================
// Tabla: Semirremolque
// =========================
export type EstadoUnidad = 'disponible' | 'en reparacion' | 'en_reparacion' | 'en viaje' | 'en_viaje' | 'fuera de servicio' | 'fuera_de_servicio';

export interface Semirremolque {
  id: number;
  nombre: string;
  dominio: string;
  anio: number;
  estado: EstadoUnidad;
  tipo_servicio?: string;
  alcance_servicio?: 'nacional' | 'internacional';
  vencimiento_rto?: string;
  vencimiento_visual_externa?: string;
  vencimiento_visual_interna?: string;
  vencimiento_espesores?: string;
  vencimiento_prueba_hidraulica?: string;
  vencimiento_mangueras?: string;
  vencimiento_valvula_flujo?: string;
}