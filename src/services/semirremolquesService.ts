import type { Semirremolque } from '@/types/semirremolque';
import api from '../utils/api';

/**
 * Obtener todos los semirremolques
 * @returns Promise con array de semirremolques
 */
export const getAllSemirremolques = async (): Promise<Semirremolque[]> => {
  try {
    const response = await api.get('/semirremolques');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener semirremolques:', error);
    throw error;
  }
};

/**
 * Obtener un semirremolque por ID
 * @param id ID del semirremolque
 * @returns Promise con el semirremolque o null si no existe
 */
export const getSemirremolqueById = async (id: string): Promise<Semirremolque | null> => {
  try {
    const response = await api.get(`/semirremolques/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error al obtener semirremolque por ID:', error);
    throw error;
  }
};

/**
 * Crear un nuevo semirremolque
 * @param semirremolque Datos del semirremolque (sin ID)
 * @returns Promise con el semirremolque creado
 */
export const createSemirremolque = async (semirremolque: Omit<Semirremolque, 'id'>): Promise<Semirremolque> => {
  try {
    // Preparar los datos para la creación
    const createData = { ...semirremolque };
    
    // Convertir las fechas a formato ISO si existen
    const fechasCampos = [
      'vencimiento_rto',
      'vencimiento_visual_externa',
      'vencimiento_visual_interna',
      'vencimiento_espesores',
      'vencimiento_prueba_hidraulica',
      'vencimiento_mangueras',
      'vencimiento_valvula_flujo'
    ] as const;
    
    fechasCampos.forEach(campo => {
      const value = createData[campo as keyof typeof createData];
      if (value && (typeof value === 'string' || typeof value === 'number')) {
        (createData as any)[campo] = new Date(value).toISOString();
      }
    });
    
    // Crear el semirremolque
    const response = await api.post('/semirremolques', createData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 409) {
      throw new Error('Ya existe un semirremolque con ese dominio');
    }
    console.error('Error al crear semirremolque:', error);
    throw error;
  }
};

/**
 * Actualizar un semirremolque existente
 * @param id ID del semirremolque a actualizar
 * @param semirremolqueData Datos actualizados del semirremolque
 * @returns Promise con el semirremolque actualizado o null si no existe
 */
export const updateSemirremolque = async (
  id: string, 
  semirremolqueData: Partial<Omit<Semirremolque, 'id'>>
): Promise<Semirremolque | null> => {
  try {
    // Verificar si el semirremolque existe
    const existingSemirremolque = await getSemirremolqueById(id);
    if (!existingSemirremolque) {
      return null;
    }
    
    // Preparar los datos para la actualización
    const updateData = { ...semirremolqueData };
    
    // Convertir las fechas a formato ISO si existen
    const fechasCampos = [
      'vencimiento_rto',
      'vencimiento_visual_ext',
      'vencimiento_visual_int',
      'vencimiento_espesores',
      'vencimiento_prueba_hidraulica',
      'vencimiento_mangueras',
      'vencimiento_valvula_five'
    ] as const;
    
    fechasCampos.forEach(campo => {
      const value = updateData[campo as keyof typeof updateData];
      if (value && (typeof value === 'string' || typeof value === 'number')) {
        (updateData as any)[campo] = new Date(value).toISOString();
      }
    });
    
    // Actualizar el semirremolque
    const response = await api.put(`/semirremolques/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    if (error.response && error.response.status === 409) {
      throw new Error('Ya existe un semirremolque con ese dominio');
    }
    console.error('Error al actualizar semirremolque:', error);
    throw error;
  }
};

/**
 * Eliminar un semirremolque por ID
 * @param id ID del semirremolque a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteSemirremolque = async (id: string): Promise<boolean> => {
  try {
    // Verificar si el semirremolque existe
    const existingSemirremolque = await getSemirremolqueById(id);
    if (!existingSemirremolque) {
      return false;
    }
    
    // Eliminar el semirremolque
    await api.delete(`/semirremolques/${id}`);
    return true;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    console.error('Error al eliminar semirremolque:', error);
    throw error;
  }
};

/**
 * Buscar semirremolques por nombre o dominio
 * @param query Texto de búsqueda
 * @returns Promise con array de semirremolques que coinciden con la búsqueda
 */
export const searchSemirremolques = async (query: string): Promise<Semirremolque[]> => {
  try {
    const response = await api.get(`/semirremolques/search`, {
      params: { query }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error al buscar semirremolques:', error);
    throw error;
  }
};

/**
 * Obtener semirremolques con vencimientos próximos
 * @param campo Campo de vencimiento a verificar
 * @param diasLimite Número de días para considerar próximo a vencer
 * @returns Promise con array de semirremolques con vencimiento próximo
 */
export const getSemirremolquesVencimientoProximo = async (
  campo: 'vencimiento_rto' | 'vencimiento_visual_ext' | 'vencimiento_visual_int' | 
         'vencimiento_espesores' | 'vencimiento_prueba_hidraulica' | 
         'vencimiento_mangueras' | 'vencimiento_valvula_five',
  diasLimite: number = 30
): Promise<Semirremolque[]> => {
  try {
    const response = await api.get('/semirremolques/vencimiento-proximo', {
      params: { campo, diasLimite }
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener semirremolques con ${campo} próximo a vencer:`, error);
    throw error;
  }
};

/**
 * Obtener semirremolques con vencimientos expirados
 * @param campo Campo de vencimiento a verificar
 * @returns Promise con array de semirremolques con vencimiento expirado
 */
export const getSemirremolquesVencimientoExpirado = async (
  campo: 'vencimiento_rto' | 'vencimiento_visual_ext' | 'vencimiento_visual_int' | 
         'vencimiento_espesores' | 'vencimiento_prueba_hidraulica' | 
         'vencimiento_mangueras' | 'vencimiento_valvula_five'
): Promise<Semirremolque[]> => {
  try {
    const response = await api.get('/semirremolques/vencimiento-expirado', {
      params: { campo }
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener semirremolques con ${campo} vencido:`, error);
    throw error;
  }
};
