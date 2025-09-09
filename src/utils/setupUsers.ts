import api from './api';

/**
 * Registra un nuevo usuario a través de la API
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @param userData Datos adicionales del usuario (nombre, apellido, etc.)
 * @returns El usuario creado o null si hubo un error
 */
export async function registerUser(
  email: string, 
  password: string, 
  userData: {
    nombre: string;
    apellido: string;
    usuario: string;
    rol_id: number; // 1 para administrador, 2 para chofer, etc.
    estado: 'Activo' | 'Inactivo' | 'Suspendido';
    observaciones?: string;
  }
) {
  try {
    // Registrar el usuario a través de la API
    const response = await api.post('/auth/register', {
      email,
      password,
      nombre: userData.nombre,
      apellido: userData.apellido,
      usuario: userData.usuario,
      rol_id: userData.rol_id,
      estado: userData.estado,
      observaciones: userData.observaciones,
      ultima_conexion: new Date().toISOString()
    });
    
    if (response.data && response.data.user) {
      return response.data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return null;
  }
}

/**
 * Crea un usuario administrador inicial si no existe ninguno
 * @returns true si se creó el usuario o ya existía uno, false si hubo un error
 */
export async function setupAdminUser(
  email: string = 'admin@rutacontrol.com',
  password: string = 'Admin123!',
  nombre: string = 'Administrador',
  apellido: string = 'Sistema'
) {
  try {
    // Verificar si ya existe algún usuario administrador
    const response = await api.get('/usuarios', {
      params: {
        rol_id: 1,
        limit: 1
      }
    });
    
    if (response.data && response.data.length > 0) {
      console.log('Ya existe un usuario administrador');
      return true;
    }
    
    // Crear usuario administrador
    const result = await registerUser(
      email,
      password,
      {
        nombre,
        apellido,
        usuario: 'admin',
        rol_id: 1, // ID del rol administrador
        estado: 'Activo'
      }
    );
    
    return !!result;
  } catch (error) {
    console.error('Error al configurar usuario administrador:', error);
    return false;
  }
}
