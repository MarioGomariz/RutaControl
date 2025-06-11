import { supabase, User, UserWithPassword } from '../utils/supabase';

/**
 * Obtener todos los usuarios
 * @returns Promise con array de usuarios
 */
export const getAllUsuarios = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*, roles:rol_id(name)')
    .order('apellido', { ascending: true });
  
  if (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener un usuario por ID
 * @param id ID del usuario
 * @returns Promise con el usuario o null si no existe
 */
export const getUsuarioById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*, roles:rol_id(name)')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error al obtener usuario por ID:', error);
    return null;
  }
  
  return data;
};

/**
 * Obtener un usuario por email
 * @param email Email del usuario
 * @returns Promise con el usuario o null si no existe
 */
export const getUsuarioByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*, roles:rol_id(name)')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error al obtener usuario por email:', error);
    return null;
  }
  
  return data;
};

/**
 * Obtener un usuario por nombre de usuario
 * @param username Nombre de usuario
 * @returns Promise con el usuario o null si no existe
 */
export const getUsuarioByUsername = async (username: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*, roles:rol_id(name)')
    .eq('usuario', username)
    .single();
  
  if (error) {
    console.error('Error al obtener usuario por nombre de usuario:', error);
    return null;
  }
  
  return data;
};

/**
 * Crear un nuevo usuario
 * @param usuario Datos del usuario (sin ID) con contraseña
 * @returns Promise con el usuario creado
 */
export const createUsuario = async (usuario: UserWithPassword): Promise<User> => {
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
  
  // Registrar el usuario en la autenticación de Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: usuario.email,
    password: usuario.contraseña, // En una aplicación real, esto debería ser manejado de forma más segura
  });
  
  if (authError) {
    console.error('Error al registrar usuario en autenticación:', authError);
    throw authError;
  }
  
  if (!authData.user) {
    throw new Error('Error al crear usuario en autenticación');
  }
  
  // Crear el usuario en la tabla users
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      usuario: usuario.usuario,
      rol_id: usuario.rol_id,
      estado: usuario.estado,
      observaciones: usuario.observaciones,
      ultima_conexion: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear usuario en base de datos:', error);
    // Intentar eliminar el usuario de autenticación si falla la creación en la base de datos
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }
  
  return data;
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
  
  // Actualizar el usuario
  const { data, error } = await supabase
    .from('users')
    .update({
      ...usuarioData,
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
  
  return data;
};

/**
 * Eliminar un usuario por ID
 * @param id ID del usuario a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteUsuario = async (id: string): Promise<boolean> => {
  // Verificar si el usuario existe
  const existingUser = await getUsuarioById(id);
  if (!existingUser) {
    return false;
  }
  
  // Eliminar el usuario de la tabla users
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar usuario de la base de datos:', error);
    throw error;
  }
  
  // Eliminar el usuario de la autenticación de Supabase
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  
  if (authError) {
    console.error('Error al eliminar usuario de autenticación:', authError);
    // No lanzamos error aquí porque el usuario ya fue eliminado de la base de datos
  }
  
  return true;
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
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('users')
    .select('*, roles:rol_id(name)')
    .or(`nombre.ilike.${searchTerm},apellido.ilike.${searchTerm},email.ilike.${searchTerm},usuario.ilike.${searchTerm}`);
  
  if (error) {
    console.error('Error al buscar usuarios:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Autenticar un usuario con nombre de usuario/email y contraseña
 * @param usernameOrEmail Nombre de usuario o email
 * @param password Contraseña
 * @returns Promise con el usuario autenticado o null si las credenciales son inválidas
 */
export const authenticateUsuario = async (usernameOrEmail: string, password: string): Promise<User | null> => {
  try {
    // Intentar autenticar directamente con email
    if (usernameOrEmail.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail,
        password,
      });
      
      if (error || !data.user) {
        return null;
      }
      
      return getUsuarioById(data.user.id);
    } else {
      // Buscar el usuario por nombre de usuario
      const usuario = await getUsuarioByUsername(usernameOrEmail);
      
      if (!usuario) {
        return null;
      }
      
      // Intentar autenticar con el email del usuario
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password,
      });
      
      if (error || !data.user) {
        return null;
      }
      
      return usuario;
    }
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
    await supabase
      .from('choferes')
      .update({ user_id: newUser.id })
      .eq('id', chofer.id);
    
    return newUser;
  } catch (error) {
    console.error('Error al crear usuario desde chofer:', error);
    return null;
  }
};
