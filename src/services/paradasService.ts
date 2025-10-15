import type { Parada, CreateParadaDTO } from '@/types/parada';
import api from '../utils/api';

/**
 * Obtener todas las paradas de un viaje
 * @param viajeId ID del viaje
 * @returns Promise con array de paradas
 */
export const getParadasByViaje = async (viajeId: string): Promise<Parada[]> => {
  try {
    const response = await api.get(`/paradas/viaje/${viajeId}`);
    return response.data || [];
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return [];
    }
    console.error('Error al obtener paradas:', error);
    throw error;
  }
};

/**
 * Crear una nueva parada
 * @param parada Datos de la parada
 * @returns Promise con la parada creada
 */
export const createParada = async (parada: CreateParadaDTO): Promise<{ id: number }> => {
  try {
    const response = await api.post('/paradas', parada);
    return response.data;
  } catch (error) {
    console.error('Error al crear parada:', error);
    throw error;
  }
};

/**
 * Finalizar un viaje
 * @param viajeId ID del viaje
 * @returns Promise con resultado de la operación
 */
export const finalizarViaje = async (viajeId: string): Promise<{ ok: boolean; message: string }> => {
  try {
    const response = await api.put(`/paradas/viaje/${viajeId}/finalizar`);
    return response.data;
  } catch (error) {
    console.error('Error al finalizar viaje:', error);
    throw error;
  }
};

/**
 * Exportar información de paradas de un viaje
 * @param viajeId ID del viaje
 * @returns Promise con la información completa del viaje y sus paradas
 */
export const exportarParadas = async (viajeId: string): Promise<any> => {
  try {
    const response = await api.get(`/paradas/viaje/${viajeId}/export`);
    return response.data;
  } catch (error) {
    console.error('Error al exportar paradas:', error);
    throw error;
  }
};
