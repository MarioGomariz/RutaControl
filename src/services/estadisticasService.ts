import api from '../utils/api';
import type { FiltrosEstadisticas, RespuestaEstadisticas } from '@/types/estadisticas';

export const obtenerEstadisticas = async (filtros?: FiltrosEstadisticas): Promise<RespuestaEstadisticas> => {
  const params = new URLSearchParams();
  
  if (filtros) {
    if (filtros.chofer_id) params.append('chofer_id', filtros.chofer_id.toString());
    if (filtros.tractor_id) params.append('tractor_id', filtros.tractor_id.toString());
    if (filtros.semirremolque_id) params.append('semirremolque_id', filtros.semirremolque_id.toString());
    if (filtros.servicio_id) params.append('servicio_id', filtros.servicio_id.toString());
    if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
    if (filtros.alcance) params.append('alcance', filtros.alcance);
  }
  
  const queryString = params.toString();
  const url = `/estadisticas${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get<RespuestaEstadisticas>(url);
  return response.data;
};
