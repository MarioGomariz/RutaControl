import type { Viaje, EstadoViaje } from '@/types/viaje';
import api from '../utils/api';

/**
 * Obtener todos los viajes
 * @returns Promise con array de viajes
 */
export const getAllViajes = async (): Promise<Viaje[]> => {
  try {
    const response = await api.get('/viajes');
    return response.data || [];
  } catch (error) {
    // Si no hay viajes, devolver arreglo vacío
    // @ts-ignore
    if (error?.response?.status === 404) {
      return [];
    }
    console.error('Error al obtener viajes:', error);
    throw error;
  }
};

/**
 * Obtener un viaje por ID
 * @param id ID del viaje
 * @returns Promise con el viaje o null si no existe
 */
export const getViajeById = async (id: string): Promise<Viaje | null> => {
  try {
    const response = await api.get(`/viajes/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error al obtener viaje por ID:', error);
    throw error;
  }
};

/**
 * Crear un nuevo viaje
 * @param viaje Datos del viaje (sin ID)
 * @returns Promise con el viaje creado
 */
export const createViaje = async (viaje: Omit<Viaje, 'id'>): Promise<Viaje> => {
  try {
    // Preparar los datos para la creación
    const createData: Omit<Viaje, 'id'> = {
      ...viaje,
      fecha_hora_salida: viaje.fecha_hora_salida
        ? new Date(viaje.fecha_hora_salida).toISOString()
        : new Date().toISOString()
    };
    
    // Crear el viaje
    const response = await api.post('/viajes', createData);
    return response.data;
  } catch (error) {
    console.error('Error al crear viaje:', error);
    throw error;
  }
};

/**
 * Actualizar un viaje existente
 * @param id ID del viaje a actualizar
 * @param viajeData Datos actualizados del viaje
 * @returns Promise con el viaje actualizado o null si no existe
 */
export const updateViaje = async (
  id: string, 
  viajeData: Partial<Omit<Viaje, 'id'>>
): Promise<Viaje | null> => {
  try {
    // Verificar si el viaje existe
    const existingViaje = await getViajeById(id);
    if (!existingViaje) {
      return null;
    }
    
    // Preparar los datos para la actualización
    const updateData: Partial<Omit<Viaje, 'id'>> = { ...viajeData };

    // Convertir fechas a formato ISO si existen
    if (updateData.fecha_hora_salida) {
      updateData.fecha_hora_salida = new Date(updateData.fecha_hora_salida).toISOString();
    }
    
    // Actualizar el viaje
    const response = await api.put(`/viajes/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error al actualizar viaje:', error);
    throw error;
  }
};

/**
 * Eliminar un viaje por ID
 * @param id ID del viaje a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteViaje = async (id: string): Promise<boolean> => {
  try {
    // Verificar si el viaje existe
    const existingViaje = await getViajeById(id);
    if (!existingViaje) {
      return false;
    }
    
    // Eliminar el viaje
    await api.delete(`/viajes/${id}`);
    return true;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    console.error('Error al eliminar viaje:', error);
    throw error;
  }
};

/**
 * Cambiar el estado de un viaje
 * @param id ID del viaje
 * @param estado Nuevo estado del viaje
 * @returns Promise con el viaje actualizado o null si no existe
 */
export const cambiarEstadoViaje = async (
  id: string, 
  estado: EstadoViaje
): Promise<Viaje | null> => {
  return updateViaje(id, { estado });
};

/**
 * Buscar viajes por origen, destino o estado
 * @param query Texto de búsqueda
 * @returns Promise con array de viajes que coinciden con la búsqueda
 */
export const searchViajes = async (query: string): Promise<Viaje[]> => {
  try {
    const response = await api.get('/viajes/search', {
      params: { query }
    });
    return response.data || [];
  } catch (error) {
    // Si no hay resultados, devolver arreglo vacío
    // @ts-ignore
    if (error?.response?.status === 404) {
      return [];
    }
    console.error('Error al buscar viajes:', error);
    throw error;
  }
};

/**
 * Obtener viajes por chofer
 * @param choferId ID del chofer
 * @returns Promise con array de viajes del chofer
 */
export const getViajesByChofer = async (choferId: string): Promise<Viaje[]> => {
  try {
    const response = await api.get(`/viajes/chofer/${choferId}`);
    return response.data || [];
  } catch (error) {
    // Si el backend devuelve 404 cuando no hay viajes para el chofer, devolvemos []
    // @ts-ignore
    if (error?.response?.status === 404) {
      return [];
    }
    console.error('Error al obtener viajes por chofer:', error);
    throw error;
  }
};

/**
 * Obtener viajes por tractor
 * @param tractorId ID del tractor
 * @returns Promise con array de viajes del tractor
 */
export const getViajesByTractor = async (tractorId: string): Promise<Viaje[]> => {
  try {
    const response = await api.get(`/viajes/tractor/${tractorId}`);
    return response.data || [];
  } catch (error) {
    // @ts-ignore
    if (error?.response?.status === 404) {
      return [];
    }
    console.error('Error al obtener viajes por tractor:', error);
    throw error;
  }
};

/**
 * Obtener viajes por semirremolque
 * @param semirremolqueId ID del semirremolque
 * @returns Promise con array de viajes del semirremolque
 */
export const getViajesBySemirremolque = async (semirremolqueId: string): Promise<Viaje[]> => {
  try {
    const response = await api.get(`/viajes/semirremolque/${semirremolqueId}`);
    return response.data || [];
  } catch (error) {
    // @ts-ignore
    if (error?.response?.status === 404) {
      return [];
    }
    console.error('Error al obtener viajes por semirremolque:', error);
    throw error;
  }
};

/**
 * Obtener viajes por estado
 * @param estado Estado del viaje
 * @returns Promise con array de viajes con el estado especificado
 */
export const getViajesByEstado = async (estado: EstadoViaje): Promise<Viaje[]> => {
  try {
    const response = await api.get(`/viajes/estado/${estado}`);
    return response.data || [];
  } catch (error) {
    // @ts-ignore
    if (error?.response?.status === 404) {
      return [];
    }
    console.error('Error al obtener viajes por estado:', error);
    throw error;
  }
};

/**
 * Obtener viajes por rango de fechas
 * @param fechaInicio Fecha de inicio del rango
 * @param fechaFin Fecha de fin del rango
 * @returns Promise con array de viajes dentro del rango de fechas
 */
export const getViajesByFechas = async (fechaInicio: string, fechaFin: string): Promise<Viaje[]> => {
  try {
    const inicio = new Date(fechaInicio).toISOString();
    const fin = new Date(fechaFin).toISOString();
    
    const response = await api.get('/viajes/fechas', {
      params: { fechaInicio: inicio, fechaFin: fin }
    });
    return response.data || [];
  } catch (error) {
    // @ts-ignore
    if (error?.response?.status === 404) {
      return [];
    }
    console.error('Error al obtener viajes por rango de fechas:', error);
    throw error;
  }
};
