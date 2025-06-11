import { supabase, Tractor } from '../utils/supabase';

/**
 * Obtener todos los tractores
 * @returns Promise con array de tractores
 */
export const getAllTractores = async (): Promise<Tractor[]> => {
  const { data, error } = await supabase
    .from('tractores')
    .select('*')
    .order('marca', { ascending: true });
  
  if (error) {
    console.error('Error al obtener tractores:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener un tractor por ID
 * @param id ID del tractor
 * @returns Promise con el tractor o null si no existe
 */
export const getTractorById = async (id: string): Promise<Tractor | null> => {
  const { data, error } = await supabase
    .from('tractores')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error al obtener tractor por ID:', error);
    return null;
  }
  
  return data;
};

/**
 * Crear un nuevo tractor
 * @param tractor Datos del tractor (sin ID)
 * @returns Promise con el tractor creado
 */
export const createTractor = async (tractor: Omit<Tractor, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Tractor> => {
  // Verificar si el dominio ya existe
  const { data: existingDominio } = await supabase
    .from('tractores')
    .select('id')
    .eq('dominio', tractor.dominio)
    .single();
  
  if (existingDominio) {
    throw new Error('Ya existe un tractor con ese dominio');
  }
  
  // Preparar los datos para la creación
  const createData = { ...tractor };
  
  // Convertir la fecha de vencimiento RTO a formato ISO si existe
  if (createData.vencimiento_rto && (typeof createData.vencimiento_rto === 'string' || typeof createData.vencimiento_rto === 'number')) {
    createData.vencimiento_rto = new Date(createData.vencimiento_rto).toISOString();
  }
  
  // Crear el tractor
  const { data, error } = await supabase
    .from('tractores')
    .insert(createData)
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear tractor:', error);
    throw error;
  }
  
  return data;
};

/**
 * Actualizar un tractor existente
 * @param id ID del tractor a actualizar
 * @param tractorData Datos actualizados del tractor
 * @returns Promise con el tractor actualizado o null si no existe
 */
export const updateTractor = async (
  id: string, 
  tractorData: Partial<Omit<Tractor, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Tractor | null> => {
  // Verificar si el tractor existe
  const { data: existingTractor } = await supabase
    .from('tractores')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingTractor) {
    return null;
  }
  
  // Verificar si el dominio está siendo actualizado y ya existe
  if (tractorData.dominio && tractorData.dominio !== existingTractor.dominio) {
    const { data: existingDominio } = await supabase
      .from('tractores')
      .select('id')
      .eq('dominio', tractorData.dominio)
      .single();
    
    if (existingDominio && existingDominio.id !== id) {
      throw new Error('Ya existe un tractor con ese dominio');
    }
  }
  
  // Preparar los datos para la actualización
  const updateData = { ...tractorData };
  
  // Convertir la fecha de vencimiento RTO a formato ISO si existe
  if (updateData.vencimiento_rto && (typeof updateData.vencimiento_rto === 'string' || typeof updateData.vencimiento_rto === 'number')) {
    updateData.vencimiento_rto = new Date(updateData.vencimiento_rto).toISOString();
  }
  
  // Actualizar el tractor
  const { data, error } = await supabase
    .from('tractores')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar tractor:', error);
    throw error;
  }
  
  return data;
};

/**
 * Eliminar un tractor por ID
 * @param id ID del tractor a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteTractor = async (id: string): Promise<boolean> => {
  // Verificar si el tractor existe
  const { data: existingTractor } = await supabase
    .from('tractores')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingTractor) {
    return false;
  }
  
  // Eliminar el tractor
  const { error } = await supabase
    .from('tractores')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar tractor:', error);
    throw error;
  }
  
  return true;
};

/**
 * Buscar tractores por marca, modelo o dominio
 * @param query Texto de búsqueda
 * @returns Promise con array de tractores que coinciden con la búsqueda
 */
export const searchTractores = async (query: string): Promise<Tractor[]> => {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('tractores')
    .select('*')
    .or(`marca.ilike.${searchTerm},modelo.ilike.${searchTerm},dominio.ilike.${searchTerm}`);
  
  if (error) {
    console.error('Error al buscar tractores:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener tractores con vencimiento RTO próximo
 * @param diasLimite Número de días para considerar próximo a vencer
 * @returns Promise con array de tractores con vencimiento RTO próximo
 */
export const getTractoresRTOProximo = async (diasLimite: number = 30): Promise<Tractor[]> => {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasLimite);
  
  const { data, error } = await supabase
    .from('tractores')
    .select('*')
    .lt('vencimiento_rto', fechaLimite.toISOString())
    .gt('vencimiento_rto', new Date().toISOString())
    .order('vencimiento_rto', { ascending: true });
  
  if (error) {
    console.error('Error al obtener tractores con RTO próximo a vencer:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener tractores con vencimiento RTO expirado
 * @returns Promise con array de tractores con vencimiento RTO expirado
 */
export const getTractoresRTOExpirado = async (): Promise<Tractor[]> => {
  const { data, error } = await supabase
    .from('tractores')
    .select('*')
    .lt('vencimiento_rto', new Date().toISOString())
    .order('vencimiento_rto', { ascending: false });
  
  if (error) {
    console.error('Error al obtener tractores con RTO vencido:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Filtrar tractores por estado
 * @param estado Estado a filtrar
 * @returns Promise con array de tractores con el estado especificado
 */
export const getTractoresPorEstado = async (estado: string): Promise<Tractor[]> => {
  const { data, error } = await supabase
    .from('tractores')
    .select('*')
    .eq('estado', estado)
    .order('marca', { ascending: true });
  
  if (error) {
    console.error(`Error al obtener tractores con estado ${estado}:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Filtrar tractores por tipo de servicio
 * @param tipoServicio Tipo de servicio a filtrar
 * @returns Promise con array de tractores con el tipo de servicio especificado
 */
export const getTractoresPorTipoServicio = async (tipoServicio: string): Promise<Tractor[]> => {
  const { data, error } = await supabase
    .from('tractores')
    .select('*')
    .eq('tipo_servicio', tipoServicio)
    .order('marca', { ascending: true });
  
  if (error) {
    console.error(`Error al obtener tractores con tipo de servicio ${tipoServicio}:`, error);
    throw error;
  }
  
  return data || [];
};
