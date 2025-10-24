import type { Servicio } from '@/types/servicio';
import api from '../utils/api';

/**
 * Obtener todos los servicios
 * Solo hay 2 servicios fijos: Gas Líquido y Combustible Líquido
 * @returns Promise con array de servicios
 */
export const getAllServicios = async (): Promise<Servicio[]> => {
  try {
    const response = await api.get('/servicios');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    throw error;
  }
};

/**
 * Obtener un servicio por ID
 * Útil para validaciones y referencias
 * @param id ID del servicio
 * @returns Promise con el servicio o null si no existe
 */
export const getServicioById = async (id: string): Promise<Servicio | null> => {
  try {
    const response = await api.get(`/servicios/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error al obtener servicio por ID:', error);
    throw error;
  }
};
