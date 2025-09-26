import type { Chofer } from '@/types/chofer';
import { getUsuarioByEmail, deleteUsuario } from './usuariosService';
import api from '../utils/api';

/**
 * Obtener todos los choferes
 * @returns Promise con array de choferes
 */
export const getAllChoferes = async (): Promise<Chofer[]> => {
  try {
    const response = await api.get('/choferes');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener choferes:', error);
    throw error;
  }
};

/**
 * Obtener un chofer por ID
 * @param id ID del chofer
 * @returns Promise con el chofer o null si no existe
 */
export const getChoferById = async (id: string): Promise<Chofer | null> => {
  try {
    const response = await api.get(`/choferes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener chofer por ID:', error);
    return null;
  }
};

/**
 * Crear un nuevo chofer
 * @param chofer Datos del chofer (sin ID)
 * @returns Promise con el chofer creado
 */
export const createChofer = async (chofer: Omit<Chofer, 'id' | 'usuario_id'>): Promise<Chofer> => {
  try {
    const response = await api.post('/choferes', chofer);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 409) {
        if (error.response.data.message.includes('DNI')) {
          throw new Error('Ya existe un chofer con ese DNI');
        } else if (error.response.data.message.includes('email')) {
          throw new Error('Ya existe un chofer con ese email');
        }
      }
    }
    console.error('Error al crear chofer:', error);
    throw error;
  }
};

/**
 * Actualizar un chofer existente
 * @param id ID del chofer a actualizar
 * @param choferData Datos actualizados del chofer
 * @returns Promise con el chofer actualizado o null si no existe
 */
export const updateChofer = async (
  id: string,
  choferData: Partial<Omit<Chofer, 'id' | 'usuario_id'>>
): Promise<Chofer | null> => {
  try {
    const updateData = { ...choferData };
    
    const response = await api.put(`/choferes/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        return null;
      } else if (error.response.status === 409) {
        if (error.response.data.message.includes('DNI')) {
          throw new Error('Ya existe un chofer con ese DNI');
        } else if (error.response.data.message.includes('email')) {
          throw new Error('Ya existe un chofer con ese email');
        }
      }
    }
    console.error('Error al actualizar chofer:', error);
    throw error;
  }
};

/**
 * Eliminar un chofer por ID
 * @param id ID del chofer a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteChofer = async (id: string): Promise<boolean> => {
  try {
    // Primero obtenemos el chofer para verificar si existe y si tiene un usuario asociado
    const chofer = await getChoferById(id);
    
    if (!chofer) {
      return false;
    }
    
    // Buscar si existe un usuario asociado por email
    if (chofer.email) {
      const usuarioAsociado = await getUsuarioByEmail(chofer.email);
      
      // Si existe un usuario asociado, eliminarlo
      if (usuarioAsociado) {
        try {
          await deleteUsuario(String(usuarioAsociado.id));
          console.log('Usuario asociado eliminado correctamente');
        } catch (error) {
          console.error('Error al eliminar usuario asociado:', error);
          // Continuamos con la eliminación del chofer aunque falle la del usuario
        }
      }
    }
    
    // Eliminar el chofer mediante la API
    await api.delete(`/choferes/${id}`);
    return true;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false; // El chofer no existe
    }
    console.error('Error al eliminar chofer:', error);
    throw error;
  }
};

/**
 * Cambiar el estado activo/inactivo de un chofer
 * @param id ID del chofer
 * @returns Promise con el chofer actualizado o null si no existe
 */
export const toggleChoferStatus = async (id: string): Promise<Chofer | null> => {
  // Obtener el chofer actual
  const chofer = await getChoferById(id);
  
  if (!chofer) {
    return null;
  }
  
  // Cambiar el estado
  return updateChofer(id, { activo: !chofer.activo });
};

/**
 * Buscar choferes por nombre, apellido o DNI
 * @param query Texto de búsqueda
 * @returns Promise con array de choferes que coinciden con la búsqueda
 */
export const searchChoferes = async (query: string): Promise<Chofer[]> => {
  try {
    const response = await api.get(`/choferes?search=${encodeURIComponent(query)}`);
    return response.data || [];
  } catch (error) {
    console.error('Error al buscar choferes:', error);
    throw error;
  }
};

/**
 * Obtener choferes con licencia próxima a vencer
 * @param diasLimite Número de días para considerar próximo a vencer
 * @returns Promise con array de choferes con licencia próxima a vencer
 */
export const getChoferesLicenciaProximaVencer = async (diasLimite: number = 30): Promise<Chofer[]> => {
  try {
    const response = await api.get(`/choferes?licenciaProximaVencer=${diasLimite}`);
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener choferes con licencia próxima a vencer:', error);
    throw error;
  }
};

/**
 * Obtener choferes con licencia vencida
 * @returns Promise con array de choferes con licencia vencida
 */
export const getChoferesLicenciaVencida = async (): Promise<Chofer[]> => {
  try {
    const response = await api.get('/choferes?licenciaVencida=true');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener choferes con licencia vencida:', error);
    throw error;
  }
};
