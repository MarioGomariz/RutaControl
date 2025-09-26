import type { Servicio } from '@/types/servicio';
import api from '../utils/api';

/**
 * Obtener todos los servicios
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

/**
 * Crear un nuevo servicio
 * @param servicio Datos del servicio (sin ID)
 * @returns Promise con el servicio creado
 */
export const createServicio = async (servicio: Omit<Servicio, 'id'>): Promise<Servicio> => {
  try {
    // Preparar los datos para la creación
    const createData = { ...servicio };
    
    // Crear el servicio
    const response = await api.post('/servicios', createData);
    return response.data;
  } catch (error) {
    console.error('Error al crear servicio:', error);
    throw error;
  }
};

/**
 * Actualizar un servicio existente
 * @param id ID del servicio a actualizar
 * @param servicioData Datos actualizados del servicio
 * @returns Promise con el servicio actualizado o null si no existe
 */
export const updateServicio = async (
  id: string, 
  servicioData: Partial<Omit<Servicio, 'id'>>
): Promise<Servicio | null> => {
  try {
    // Verificar si el servicio existe
    const existingServicio = await getServicioById(id);
    if (!existingServicio) {
      return null;
    }
    
    // Preparar los datos para la actualización
    const updateData: Partial<Omit<Servicio, 'id'>> = { ...servicioData };
    
    // Actualizar el servicio
    const response = await api.put(`/servicios/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error al actualizar servicio:', error);
    throw error;
  }
};

/**
 * Eliminar un servicio por ID
 * @param id ID del servicio a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteServicio = async (id: string): Promise<boolean> => {
  try {
    // Verificar si el servicio existe
    const existingServicio = await getServicioById(id);
    if (!existingServicio) {
      return false;
    }
    
    // Eliminar el servicio
    await api.delete(`/servicios/${id}`);
    return true;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    console.error('Error al eliminar servicio:', error);
    throw error;
  }
};

/**
 * Buscar servicios por nombre, descripcion o número de remito
 * @param query Texto de búsqueda
 * @returns Promise con array de servicios que coinciden con la búsqueda
 */
export const searchServicios = async (query: string): Promise<Servicio[]> => {
  try {
    const response = await api.get('/servicios/search', {
      params: { query }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error al buscar servicios:', error);
    throw error;
  }
};

/**
 * Obtener servicios por rango de fechas
 * @param fechaInicio Fecha de inicio del rango
 * @param fechaFin Fecha de fin del rango
 * @returns Promise con array de servicios en el rango de fechas
 */
export const getServiciosPorFechaCreacion = async (fechaInicio: Date, fechaFin: Date): Promise<Servicio[]> => {
  try {
    const response = await api.get('/servicios/by-date', {
      params: {
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener servicios por fecha de creación:', error);
    throw error;
  }
};

/**
 * Obtener servicios por observaciones
 * @param observaciones Estado del servicio
 * @returns Promise con array de servicios con el observaciones especificado
 */
export const getServiciosPorTipo = async (nombre: string): Promise<Servicio[]> => {
  try {
    const response = await api.get('/servicios/by-tipo', {
      params: { nombre }
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener servicios con nombre ${nombre}:`, error);
    throw error;
  }
};

/**
 * Obtener servicios por chofer
 * @param choferId ID del chofer
 * @returns Promise con array de servicios del chofer especificado
 */
export const getServiciosPorRequerimiento = async (requiere: boolean): Promise<Servicio[]> => {
  try {
    const response = await api.get('/servicios/by-requerimiento', {
      params: { requiere }
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener servicios con requerimiento de prueba hidráulica:`, error);
    throw error;
  }
};

/**
 * Obtener servicios por tractor
 * @param tractorId ID del tractor
 * @returns Promise con array de servicios del tractor especificado
 */
export const getServiciosPorVisual = async (requiere: boolean): Promise<Servicio[]> => {
  try {
    const response = await api.get('/servicios/by-visual', {
      params: { requiere }
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener servicios con requerimiento de visuales:`, error);
    throw error;
  }
};

/**
 * Obtener servicios por semirremolque
 * @param semirremolqueId ID del semirremolque
 * @returns Promise con array de servicios del semirremolque especificado
 */
export const getServiciosPorValvula = async (requiere: boolean): Promise<Servicio[]> => {
  try {
    const response = await api.get('/servicios/by-valvula', {
      params: { requiere }
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener servicios con requerimiento de válvulas y mangueras:`, error);
    throw error;
  }
};

// Las funciones relacionadas con 'observaciones' fueron eliminadas porque
// el tipo Servicio no incluye ese campo en el nuevo esquema.
