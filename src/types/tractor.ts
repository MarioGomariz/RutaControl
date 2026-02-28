// =========================
// Tabla: Tractores
// =========================

export type EstadoUnidad = 'disponible' | 'en reparacion' | 'en_reparacion' | 'en viaje' | 'en_viaje' | 'fuera de servicio' | 'fuera_de_servicio';

export interface Tractor {
  id: number;
  marca: string;
  modelo: string;
  dominio: string;
  anio: number;
  vencimiento_rto?: string;
  estado: EstadoUnidad;
  tipo_servicio?: string;
  alcance_servicio?: 'nacional' | 'internacional';
}