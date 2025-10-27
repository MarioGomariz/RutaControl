import type { Tractor } from '@/types/tractor';
import api from '../utils/api';

/**
 * Obtener todos los tractores
 * @returns Promise con array de tractores
 */
export const getAllTractores = async (): Promise<Tractor[]> => {
  try {
    const response = await api.get('/tractores');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener tractores:', error);
    throw error;
  }
};

/**
 * Obtener un tractor por ID
 * @param id ID del tractor
 * @returns Promise con el tractor o null si no existe
 */
export const getTractorById = async (id: string): Promise<Tractor | null> => {
  try {
    const response = await api.get(`/tractores/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error al obtener tractor por ID:', error);
    throw error;
  }
};

/**
 * Crear un nuevo tractor
 * @param tractor Datos del tractor (sin ID)
 * @returns Promise con el tractor creado
 */
export const createTractor = async (tractor: Omit<Tractor, 'id'>): Promise<Tractor> => {
  try {
    // Preparar los datos para la creación
    const createData = { ...tractor };
    
    // Convertir la fecha de vencimiento RTO a formato ISO si existe
    if (createData.vencimiento_rto && (typeof createData.vencimiento_rto === 'string' || typeof createData.vencimiento_rto === 'number')) {
      createData.vencimiento_rto = new Date(createData.vencimiento_rto).toISOString();
    }
    
    // Crear el tractor
    const response = await api.post('/tractores', createData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 409) {
      throw new Error('Ya existe un tractor con ese dominio');
    }
    console.error('Error al crear tractor:', error);
    throw error;
  }
};

/**
 * Actualizar un tractor existente
 * @param id ID del tractor a actualizar
 * @param tractorData Datos actualizados del tractor
 * @returns Promise con el tractor actualizado o null si no existe
 */
export const updateTractor = async (
  id: string, 
  tractorData: Partial<Omit<Tractor, 'id'>>
): Promise<Tractor | null> => {
  try {
    // Verificar si el tractor existe
    const existingTractor = await getTractorById(id);
    if (!existingTractor) {
      return null;
    }
    
    // Preparar los datos para la actualización
    const updateData = { ...tractorData };
    
    // Convertir la fecha de vencimiento RTO a formato ISO si existe
    if (updateData.vencimiento_rto && (typeof updateData.vencimiento_rto === 'string' || typeof updateData.vencimiento_rto === 'number')) {
      updateData.vencimiento_rto = new Date(updateData.vencimiento_rto).toISOString();
    }
    
    // Actualizar el tractor
    const response = await api.put(`/tractores/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    if (error.response && error.response.status === 409) {
      throw new Error('Ya existe un tractor con ese dominio');
    }
    console.error('Error al actualizar tractor:', error);
    throw error;
  }
};

/**
 * Eliminar un tractor por ID
 * @param id ID del tractor a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteTractor = async (id: string): Promise<boolean> => {
  try {
    // Verificar si el tractor existe
    const existingTractor = await getTractorById(id);
    if (!existingTractor) {
      return false;
    }
    
    // Eliminar el tractor
    await api.delete(`/tractores/${id}`);
    return true;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    // Detectar error de restricción de clave foránea o usar mensaje del backend
    if (error.response?.status === 400 && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.response?.data?.sqlMessage?.includes('foreign key constraint fails') || 
        error.response?.data?.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error('No se puede eliminar el tractor porque está asignado a uno o más viajes. Primero debe reasignar o eliminar esos viajes.');
    }
    console.error('Error al eliminar tractor:', error);
    throw error;
  }
};

/**
 * Buscar tractores por marca, modelo o dominio
 * @param query Texto de búsqueda
 * @returns Promise con array de tractores que coinciden con la búsqueda
 */
export const searchTractores = async (query: string): Promise<Tractor[]> => {
  try {
    const response = await api.get(`/tractores/search?query=${encodeURIComponent(query)}`);
    return response.data || [];
  } catch (error) {
    console.error('Error al buscar tractores:', error);
    throw error;
  }
};

/**
 * Obtener tractores con vencimiento RTO próximo
 * @param diasLimite Número de días para considerar próximo a vencer
 * @returns Promise con array de tractores con vencimiento RTO próximo
 */
export const getTractoresRTOProximo = async (diasLimite: number = 30): Promise<Tractor[]> => {
  try {
    const response = await api.get(`/tractores/rto-proximo?dias=${diasLimite}`);
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener tractores con RTO próximo:', error);
    throw error;
  }
};

/**
 * Obtener tractores con vencimiento RTO expirado
 * @returns Promise con array de tractores con vencimiento RTO expirado
 */
export const getTractoresRTOExpirado = async (): Promise<Tractor[]> => {
  try {
    const response = await api.get('/tractores/rto-expirado');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener tractores con RTO vencido:', error);
    throw error;
  }
};

/**
 * Filtrar tractores por estado
 * @param estado Estado a filtrar
 * @returns Promise con array de tractores con el estado especificado
 */
export const getTractoresPorEstado = async (estado: string): Promise<Tractor[]> => {
  try {
    const response = await api.get(`/tractores/estado/${encodeURIComponent(estado)}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener tractores con estado ${estado}:`, error);
    throw error;
  }
};

/**
 * Filtrar tractores por tipo de servicio
 * @param tipoServicio Tipo de servicio a filtrar
 * @returns Promise con array de tractores con el tipo de servicio especificado
 */
export const getTractoresPorTipoServicio = async (tipoServicio: string): Promise<Tractor[]> => {
  try {
    const response = await api.get(`/tractores/tipo-servicio/${encodeURIComponent(tipoServicio)}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener tractores con tipo de servicio ${tipoServicio}:`, error);
    throw error;
  }
};
