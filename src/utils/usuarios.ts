// Define the Usuario type
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  contraseña: string;
  rol: 'administrador' | 'chofer';
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
  ultimaConexion: string;
  observaciones?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Mock data for initial usuarios
const initialUsuarios: Usuario[] = [
  {
    id: '1',
    nombre: 'Test',
    apellido: 'Admin',
    email: 'test@gmail.com',
    usuario: 'test',
    contraseña: '123456', // En una aplicación real, esto debería estar hasheado
    rol: 'administrador',
    estado: 'Activo',
    ultimaConexion: new Date().toISOString(),
    observaciones: 'Usuario administrador de prueba',
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaActualizacion: new Date().toISOString().split('T')[0]
  }
];

// Storage key for localStorage
const USUARIOS_STORAGE_KEY = 'usuarios_data';

/**
 * Initialize the usuarios data in localStorage if it doesn't exist
 */
const initializeUsuarios = (): void => {
  if (!localStorage.getItem(USUARIOS_STORAGE_KEY)) {
    localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(initialUsuarios));
  }
};

/**
 * Get all usuarios
 * @returns Array of all usuarios
 */
export const getAllUsuarios = (): Usuario[] => {
  initializeUsuarios();
  const data = localStorage.getItem(USUARIOS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Get a usuario by ID
 * @param id Usuario ID
 * @returns Usuario object or null if not found
 */
export const getUsuarioById = (id: string): Usuario | null => {
  const usuarios = getAllUsuarios();
  return usuarios.find(usuario => usuario.id === id) || null;
};

/**
 * Get a usuario by email
 * @param email Usuario email
 * @returns Usuario object or null if not found
 */
export const getUsuarioByEmail = (email: string): Usuario | null => {
  const usuarios = getAllUsuarios();
  return usuarios.find(usuario => usuario.email === email) || null;
};

/**
 * Get a usuario by username
 * @param username Usuario username
 * @returns Usuario object or null if not found
 */
export const getUsuarioByUsername = (username: string): Usuario | null => {
  const usuarios = getAllUsuarios();
  return usuarios.find(usuario => usuario.usuario === username) || null;
};

/**
 * Create a new usuario
 * @param usuario Usuario data (without ID)
 * @returns The created usuario with ID
 */
export const createUsuario = (usuario: Omit<Usuario, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Usuario => {
  const usuarios = getAllUsuarios();
  
  // Check if email or username already exists
  const existingEmail = usuarios.find(u => u.email === usuario.email);
  if (existingEmail) {
    throw new Error('El correo electrónico ya está en uso');
  }
  
  const existingUsername = usuarios.find(u => u.usuario === usuario.usuario);
  if (existingUsername) {
    throw new Error('El nombre de usuario ya está en uso');
  }
  
  // Generate a new ID (in a real app, this would be handled by the backend)
  const newId = (Math.max(...usuarios.map(u => parseInt(u.id)), 0) + 1).toString();
  
  const now = new Date().toISOString().split('T')[0];
  
  const newUsuario: Usuario = {
    ...usuario,
    id: newId,
    fechaCreacion: now,
    fechaActualizacion: now
  };
  
  // Add to the list and save
  const updatedUsuarios = [...usuarios, newUsuario];
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(updatedUsuarios));
  
  return newUsuario;
};

/**
 * Update an existing usuario
 * @param id Usuario ID to update
 * @param usuarioData Updated usuario data
 * @returns Updated usuario or null if not found
 */
export const updateUsuario = (id: string, usuarioData: Partial<Omit<Usuario, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>): Usuario | null => {
  const usuarios = getAllUsuarios();
  const index = usuarios.findIndex(usuario => usuario.id === id);
  
  if (index === -1) return null;
  
  // Check if email is being updated and is already in use by another user
  if (usuarioData.email && 
      usuarioData.email !== usuarios[index].email && 
      usuarios.some(u => u.id !== id && u.email === usuarioData.email)) {
    throw new Error('El correo electrónico ya está en uso');
  }
  
  // Check if username is being updated and is already in use by another user
  if (usuarioData.usuario && 
      usuarioData.usuario !== usuarios[index].usuario && 
      usuarios.some(u => u.id !== id && u.usuario === usuarioData.usuario)) {
    throw new Error('El nombre de usuario ya está en uso');
  }
  
  // Update the usuario
  const updatedUsuario: Usuario = {
    ...usuarios[index],
    ...usuarioData,
    fechaActualizacion: new Date().toISOString().split('T')[0]
  };
  
  usuarios[index] = updatedUsuario;
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(usuarios));
  
  return updatedUsuario;
};

/**
 * Delete a usuario by ID
 * @param id Usuario ID to delete
 * @returns true if deleted, false if not found
 */
export const deleteUsuario = (id: string): boolean => {
  const usuarios = getAllUsuarios();
  const filteredUsuarios = usuarios.filter(usuario => usuario.id !== id);
  
  if (filteredUsuarios.length === usuarios.length) {
    return false; // Usuario not found
  }
  
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(filteredUsuarios));
  return true;
};

/**
 * Update a usuario's status
 * @param id Usuario ID
 * @param estado New status
 * @returns Updated usuario or null if not found
 */
export const updateUsuarioEstado = (id: string, estado: 'Activo' | 'Inactivo' | 'Suspendido'): Usuario | null => {
  return updateUsuario(id, { estado });
};

/**
 * Update a usuario's last connection time
 * @param id Usuario ID
 * @returns Updated usuario or null if not found
 */
export const updateUltimaConexion = (id: string): Usuario | null => {
  return updateUsuario(id, { ultimaConexion: new Date().toISOString() });
};

/**
 * Search usuarios by name, last name, email or username
 * @param query Search query
 * @returns Array of matching usuarios
 */
export const searchUsuarios = (query: string): Usuario[] => {
  if (!query.trim()) return getAllUsuarios();
  
  const usuarios = getAllUsuarios();
  const lowerQuery = query.toLowerCase();
  
  return usuarios.filter(usuario => 
    usuario.nombre.toLowerCase().includes(lowerQuery) ||
    usuario.apellido.toLowerCase().includes(lowerQuery) ||
    usuario.email.toLowerCase().includes(lowerQuery) ||
    usuario.usuario.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Create a user account for a chofer
 * @param chofer Chofer data to create user from
 * @param password Initial password
 * @returns The created usuario
 */
export const createUsuarioFromChofer = (
  chofer: { 
    id: string; 
    nombre: string; 
    apellido: string; 
    email?: string;
  }, 
  password: string
): Usuario | null => {
  // If chofer doesn't have an email, we can't create a user
  if (!chofer.email) return null;
  
  try {
    // Create username from name and id
    const username = `${chofer.nombre.toLowerCase()}.${chofer.apellido.toLowerCase()}${chofer.id}`;
    
    const nuevoUsuario: Omit<Usuario, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
      nombre: chofer.nombre,
      apellido: chofer.apellido,
      email: chofer.email,
      usuario: username,
      contraseña: password,
      rol: 'chofer',
      estado: 'Activo',
      ultimaConexion: '',
      observaciones: `Usuario creado automáticamente para el chofer ID: ${chofer.id}`
    };
    
    return createUsuario(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear usuario para chofer:', error);
    return null;
  }
};

/**
 * Reset to initial data (useful for testing or resetting the app)
 */
export const resetUsuariosData = (): void => {
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(initialUsuarios));
};

/**
 * Authenticate a user with username/email and password
 * @param usernameOrEmail Username or email
 * @param password Password
 * @returns Usuario if authenticated, null if not
 */
export const authenticateUsuario = (usernameOrEmail: string, password: string): Usuario | null => {
  const usuarios = getAllUsuarios();
  
  // Find user by username or email
  const usuario = usuarios.find(
    u => (u.usuario === usernameOrEmail || u.email === usernameOrEmail) && 
         u.contraseña === password && 
         u.estado === 'Activo'
  );
  
  if (usuario) {
    // Update last connection time
    updateUltimaConexion(usuario.id);
    return usuario;
  }
  
  return null;
};
