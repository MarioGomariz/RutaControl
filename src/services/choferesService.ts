import { supabase, Chofer } from '../utils/supabase';
import { getUsuarioByEmail, deleteUsuario } from './usuariosService';

/**
 * Obtener todos los choferes
 * @returns Promise con array de choferes
 */
export const getAllChoferes = async (): Promise<Chofer[]> => {
  const { data, error } = await supabase
    .from('choferes')
    .select('*')
    .order('apellido', { ascending: true });
  
  if (error) {
    console.error('Error al obtener choferes:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener un chofer por ID
 * @param id ID del chofer
 * @returns Promise con el chofer o null si no existe
 */
export const getChoferById = async (id: string): Promise<Chofer | null> => {
  const { data, error } = await supabase
    .from('choferes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error al obtener chofer por ID:', error);
    return null;
  }
  
  return data;
};

/**
 * Crear un nuevo chofer
 * @param chofer Datos del chofer (sin ID)
 * @returns Promise con el chofer creado
 */
export const createChofer = async (chofer: Omit<Chofer, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Chofer> => {
  // Verificar si el DNI ya existe
  const { data: existingDni } = await supabase
    .from('choferes')
    .select('id')
    .eq('dni', chofer.dni)
    .single();
  
  if (existingDni) {
    throw new Error('Ya existe un chofer con ese DNI');
  }
  
  // Verificar si el email ya existe (si se proporciona)
  if (chofer.email) {
    const { data: existingEmail } = await supabase
      .from('choferes')
      .select('id')
      .eq('email', chofer.email)
      .single();
    
    if (existingEmail) {
      throw new Error('Ya existe un chofer con ese email');
    }
  }
  
  // Crear el chofer
  const { data, error } = await supabase
    .from('choferes')
    .insert({
      ...chofer,
      fecha_vencimiento_licencia: chofer.fecha_vencimiento_licencia ? new Date(chofer.fecha_vencimiento_licencia).toISOString() : null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear chofer:', error);
    throw error;
  }
  
  return data;
};

/**
 * Actualizar un chofer existente
 * @param id ID del chofer a actualizar
 * @param choferData Datos actualizados del chofer
 * @returns Promise con el chofer actualizado o null si no existe
 */
export const updateChofer = async (
  id: string, 
  choferData: Partial<Omit<Chofer, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Chofer | null> => {
  // Verificar si el chofer existe
  const { data: existingChofer } = await supabase
    .from('choferes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingChofer) {
    return null;
  }
  
  // Verificar si el DNI está siendo actualizado y ya existe
  if (choferData.dni && choferData.dni !== existingChofer.dni) {
    const { data: existingDni } = await supabase
      .from('choferes')
      .select('id')
      .eq('dni', choferData.dni)
      .single();
    
    if (existingDni && existingDni.id !== id) {
      throw new Error('Ya existe un chofer con ese DNI');
    }
  }
  
  // Verificar si el email está siendo actualizado y ya existe
  if (choferData.email && choferData.email !== existingChofer.email) {
    const { data: existingEmail } = await supabase
      .from('choferes')
      .select('id')
      .eq('email', choferData.email)
      .single();
    
    if (existingEmail && existingEmail.id !== id) {
      throw new Error('Ya existe un chofer con ese email');
    }
  }
  
  // Preparar los datos para la actualización
  const updateData = { ...choferData };
  
  // Convertir la fecha de vencimiento de licencia a formato ISO si existe
  if (updateData.fecha_vencimiento_licencia) {
    updateData.fecha_vencimiento_licencia = new Date(updateData.fecha_vencimiento_licencia).toISOString();
  }
  
  // Actualizar el chofer
  const { data, error } = await supabase
    .from('choferes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar chofer:', error);
    throw error;
  }
  
  return data;
};

/**
 * Eliminar un chofer por ID
 * @param id ID del chofer a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteChofer = async (id: string): Promise<boolean> => {
  // Verificar si el chofer existe
  const { data: existingChofer } = await supabase
    .from('choferes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingChofer) {
    return false;
  }
  
  // Buscar si existe un usuario asociado por email
  if (existingChofer.email) {
    const usuarioAsociado = await getUsuarioByEmail(existingChofer.email);
    
    // Si existe un usuario asociado, eliminarlo
    if (usuarioAsociado) {
      try {
        await deleteUsuario(usuarioAsociado.id);
        console.log('Usuario asociado eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar usuario asociado:', error);
        // Continuamos con la eliminación del chofer aunque falle la del usuario
      }
    }
  }
  
  // Eliminar el chofer
  const { error } = await supabase
    .from('choferes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar chofer:', error);
    throw error;
  }
  
  return true;
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
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('choferes')
    .select('*')
    .or(`nombre.ilike.${searchTerm},apellido.ilike.${searchTerm},dni.ilike.${searchTerm}`);
  
  if (error) {
    console.error('Error al buscar choferes:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener choferes con licencia próxima a vencer
 * @param diasLimite Número de días para considerar próximo a vencer
 * @returns Promise con array de choferes con licencia próxima a vencer
 */
export const getChoferesLicenciaProximaVencer = async (diasLimite: number = 30): Promise<Chofer[]> => {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasLimite);
  
  const { data, error } = await supabase
    .from('choferes')
    .select('*')
    .lt('fecha_vencimiento_licencia', fechaLimite.toISOString())
    .gt('fecha_vencimiento_licencia', new Date().toISOString())
    .order('fecha_vencimiento_licencia', { ascending: true });
  
  if (error) {
    console.error('Error al obtener choferes con licencia próxima a vencer:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener choferes con licencia vencida
 * @returns Promise con array de choferes con licencia vencida
 */
export const getChoferesLicenciaVencida = async (): Promise<Chofer[]> => {
  const { data, error } = await supabase
    .from('choferes')
    .select('*')
    .lt('fecha_vencimiento_licencia', new Date().toISOString())
    .order('fecha_vencimiento_licencia', { ascending: false });
  
  if (error) {
    console.error('Error al obtener choferes con licencia vencida:', error);
    throw error;
  }
  
  return data || [];
};
