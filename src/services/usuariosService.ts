import { User, UserWithPassword } from '../types';
import api from '../utils/api';

/**
 * Obtener todos los usuarios
 * @returns Promise con array de usuarios
 */
export const getAllUsuarios = async (): Promise<User[]> => {
  try {
    const response = await api.get('/usuarios');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtener un usuario por ID
 * @param id ID del usuario
 * @returns Promise con el usuario o null si no existe
 */
export const getUsuarioById = async (id: string): Promise<User | null> => {
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

/**
 * Obtener un usuario por email
 * @param email Email del usuario
 * @returns Promise con el usuario o null si no existe
 */
export const getUsuarioByEmail = async (email: string): Promise<User | null> => {
  try {
    const response = await api.get('/usuarios/email', {
      params: { email }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener usuario por email:', error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Obtener un usuario por nombre de usuario
 * @param username Nombre de usuario
 * @returns Promise con el usuario o null si no existe
 */
export const getUsuarioByUsername = async (username: string): Promise<User | null> => {
  try {
    const response = await api.get('/usuarios/username', {
      params: { username }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener usuario por nombre de usuario:', error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Crear un nuevo usuario
 * @param usuario Datos del usuario (sin ID) con contraseña
 * @returns Promise con el usuario creado
 */
export const createUsuario = async (usuario: UserWithPassword): Promise<User> => {
  try {
    // Verificar si el email ya existe
    const existingEmail = await getUsuarioByEmail(usuario.email);
    if (existingEmail) {
      throw new Error('El correo electrónico ya está en uso');
    }
    
    // Verificar si el nombre de usuario ya existe
    const existingUsername = await getUsuarioByUsername(usuario.usuario);
    if (existingUsername) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    
    // Crear el usuario a través de la API
    const response = await api.post('/usuarios', {
      ...usuario,
      ultima_conexion: new Date().toISOString()
    });
    
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
  usuarioData: Partial<Omit<User, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<User | null> => {
  try {
    // Verificar si el usuario existe
    const existingUser = await getUsuarioById(id);
    if (!existingUser) {
      return null;
    }
    
    // Verificar si el email está siendo actualizado y ya existe
    if (usuarioData.email && 
        usuarioData.email !== existingUser.email) {
      const existingEmail = await getUsuarioByEmail(usuarioData.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error('El correo electrónico ya está en uso');
      }
    }
    
    // Verificar si el nombre de usuario está siendo actualizado y ya existe
    if (usuarioData.usuario && 
        usuarioData.usuario !== existingUser.usuario) {
      const existingUsername = await getUsuarioByUsername(usuarioData.usuario);
      if (existingUsername && existingUsername.id !== id) {
        throw new Error('El nombre de usuario ya está en uso');
      }
    }
    
    // Actualizar el usuario a través de la API
    const response = await api.put(`/usuarios/${id}`, {
      ...usuarioData,
      fecha_actualizacion: new Date().toISOString()
    });
    
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
export const updateUsuarioEstado = async (id: string, estado: 'Activo' | 'Inactivo' | 'Suspendido'): Promise<User | null> => {
  return updateUsuario(id, { estado });
};

/**
 * Actualizar la última conexión de un usuario
 * @param id ID del usuario
 * @returns Promise con el usuario actualizado o null si no existe
 */
export const updateUltimaConexion = async (id: string): Promise<User | null> => {
  return updateUsuario(id, { ultima_conexion: new Date().toISOString() });
};

/**
 * Buscar usuarios por nombre, apellido, email o nombre de usuario
 * @param query Texto de búsqueda
 * @returns Promise con array de usuarios que coinciden con la búsqueda
 */
export const searchUsuarios = async (query: string): Promise<User[]> => {
  try {
    const response = await api.get('/usuarios/search', {
      params: { query }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    throw error;
  }
};

/**
 * Autenticar un usuario con nombre de usuario/email y contraseña
 * @param usernameOrEmail Nombre de usuario o email
 * @param password Contraseña
 * @returns Promise con el usuario autenticado o null si las credenciales son inválidas
 */
export const authenticateUsuario = async (usernameOrEmail: string, password: string): Promise<User | null> => {
  try {
    const response = await api.post('/auth/login', {
      usernameOrEmail,
      password
    });
    
    if (response.data && response.data.user) {
      // Si la API devuelve un token, podríamos guardarlo aquí para futuras peticiones
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      // Actualizar la última conexión del usuario
      await updateUltimaConexion(response.data.user.id);
      
      return response.data.user;
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
export const createUsuarioFromChofer = async (
  chofer: { 
    id: string; 
    nombre: string; 
    apellido: string; 
    email?: string;
    dni: string;
  }, 
  password: string
): Promise<User | null> => {
  try {
    if (!chofer.email) {
      throw new Error('El chofer debe tener un email para crear un usuario');
    }
    
    // Verificar si ya existe un usuario con ese email
    const existingUser = await getUsuarioByEmail(chofer.email);
    if (existingUser) {
      return existingUser; // Devolver el usuario existente
    }
    
    // Crear un nombre de usuario basado en el nombre y apellido
    let username = `${chofer.nombre.toLowerCase()}.${chofer.apellido.toLowerCase()}`;
    username = username
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/\s+/g, '.') // Reemplazar espacios por puntos
      .replace(/[^a-z0-9.]/g, ''); // Eliminar caracteres especiales
    
    // Verificar si el nombre de usuario ya existe
    const existingUsername = await getUsuarioByUsername(username);
    if (existingUsername) {
      // Añadir los últimos 4 dígitos del DNI al nombre de usuario
      const dniSuffix = chofer.dni.slice(-4);
      username = `${username}${dniSuffix}`;
    }
    
    // Crear el usuario
    const newUser = await createUsuario({
      nombre: chofer.nombre,
      apellido: chofer.apellido,
      email: chofer.email,
      usuario: username,
      contraseña: password,
      rol_id: 2, // Rol de chofer
      estado: 'Activo',
      ultima_conexion: new Date().toISOString(),
      observaciones: `Usuario creado automáticamente para el chofer ID: ${chofer.id}`
    });
    
    // Actualizar el chofer con el ID del usuario
    await api.patch(`/choferes/${chofer.id}/usuario`, {
      user_id: newUser.id
    });
    
    return newUser;
  } catch (error) {
    console.error('Error al crear usuario desde chofer:', error);
    return null;
  }
};
