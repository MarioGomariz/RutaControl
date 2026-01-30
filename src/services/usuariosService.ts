import { Usuario } from '@/types/usuario';
import api from '../utils/api';

/**
 * Obtener todos los usuarios
 * @returns Promise con array de usuarios
 */
export const getAllUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await api.get('/usuarios');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtener un usuario por email (stub temporal durante migración de tipos)
 */
export const getUsuarioByEmail = async (_email: string): Promise<Usuario | null> => {
  // La API real puede implementar este endpoint; por ahora devolvemos null
  return null;
};

/**
 * Obtener un usuario por nombre de usuario (stub temporal durante migración de tipos)
 */
export const getUsuarioByUsername = async (_username: string): Promise<Usuario | null> => {
  // La API real puede implementar este endpoint; por ahora devolvemos null
  return null;
};

/**
 * Obtener un usuario por ID
 * @param id ID del usuario
 * @returns Promise con el usuario o null si no existe
 */
export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  try {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener usuario por ID:', error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

// Endpoints auxiliares (si existen en la API) se podrán reintroducir luego

/**
 * Crear un nuevo usuario
 * @param usuario Datos del usuario (sin ID) con contraseña
 * @returns Promise con el usuario creado
 */
export const createUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<Usuario> => {
  try {
    // Crear el usuario a través de la API
    const response = await api.post('/usuarios', usuario);
    
    return response.data;
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Actualizar un usuario existente
 * @param id ID del usuario a actualizar
 * @param usuarioData Datos actualizados del usuario
 * @returns Promise con el usuario actualizado o null si no existe
 */
export const updateUsuario = async (
  id: string, 
  usuarioData: Partial<Omit<Usuario, 'id'>>
): Promise<Usuario | null> => {
  try {
    // Verificar si el usuario existe
    const existingUser = await getUsuarioById(id);
    if (!existingUser) {
      return null;
    }
    // Validaciones de unicidad (si la API las hace server-side, podemos omitir aquí)
    // Actualizar el usuario a través de la API
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Eliminar un usuario por ID
 * @param id ID del usuario a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteUsuario = async (id: string): Promise<boolean> => {
  try {
    // Verificar si el usuario existe
    const existingUser = await getUsuarioById(id);
    if (!existingUser) {
      return false;
    }
    
    // Eliminar el usuario a través de la API
    await api.delete(`/usuarios/${id}`);
    return true;
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Actualizar el estado de un usuario
 * @param id ID del usuario
 * @param estado Nuevo estado
 * @returns Promise con el usuario actualizado o null si no existe
 */
// Con el nuevo modelo no existe 'estado'; se gestiona con 'activo'

/**
 * Actualizar la última conexión de un usuario
 * @param id ID del usuario
 * @returns Promise con el usuario actualizado o null si no existe
 */
// Eliminado: ultima_conexion ya no existe en el tipo actual

/**
 * Buscar usuarios por nombre de usuario
 * @param query Texto de búsqueda
 * @returns Promise con array de usuarios que coinciden con la búsqueda
 */
export const searchUsuarios = async (query: string): Promise<Usuario[]> => {
  try {
    const response = await api.get('/usuarios/search', {
      params: { query }
    });
    return response.data || [];
  } catch (error: any) {
    console.error('Error al buscar usuarios:', error);
    
    // Manejo detallado de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || 'Error desconocido';
      const details = error.response.data?.details || '';
      
      if (status === 404) {
        throw new Error('Endpoint de búsqueda no encontrado. Contacte al administrador.');
      } else if (status === 400) {
        throw new Error(`Error de búsqueda: ${message}`);
      } else if (status === 401) {
        throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
      } else if (status === 500) {
        throw new Error(`Error del servidor: ${message}${details ? ` - ${details}` : ''}`);
      } else {
        throw new Error(`Error ${status}: ${message}`);
      }
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión.');
    } else {
      // Algo sucedió al configurar la solicitud
      throw new Error(`Error al buscar usuarios: ${error.message}`);
    }
  }
};

/**
 * Autenticar un usuario con nombre de usuario/email y contraseña
 * @param usernameOrEmail Nombre de usuario o email
 * @param password Contraseña
 * @returns Promise con el usuario autenticado o null si las credenciales son inválidas
 */
export const authenticateUsuario = async (usernameOrEmail: string, password: string): Promise<Usuario | null> => {
  try {
    const response = await api.post('/auth/login', {
      usernameOrEmail,
      password
    });
    
    if (response.data && response.data.user) {
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data.user as Usuario;
    }
    
    return null;
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    return null;
  }
};

/**
 * Crear un usuario a partir de los datos de un chofer
 * @param chofer Datos del chofer
 * @param password Contraseña inicial
 * @returns Promise con el usuario creado o null si hay error
 */
// Eliminado: creación de usuario desde chofer ya no aplica con el modelo actual
