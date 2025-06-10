import { supabase } from './supabase';

/**
 * Registra un nuevo usuario en Supabase Auth y en la tabla users
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
    // 1. Registrar el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError || !authData.user) {
      console.error('Error al registrar usuario en Auth:', authError);
      return null;
    }
    
    // 2. Insertar el usuario en la tabla users
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        usuario: userData.usuario,
        rol_id: userData.rol_id,
        estado: userData.estado,
        observaciones: userData.observaciones,
        ultima_conexion: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error al crear usuario en la tabla users:', error);
      // Intentar eliminar el usuario de Auth si falla la creación en la tabla
      await supabase.auth.admin.deleteUser(authData.user.id);
      return null;
    }
    
    return data;
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
    const { data: existingAdmins } = await supabase
      .from('users')
      .select('id')
      .eq('rol_id', 1) // Asumiendo que 1 es el ID del rol administrador
      .limit(1);
    
    if (existingAdmins && existingAdmins.length > 0) {
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
