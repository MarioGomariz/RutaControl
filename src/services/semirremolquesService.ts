import { supabase, Semirremolque } from '../utils/supabase';

/**
 * Obtener todos los semirremolques
 * @returns Promise con array de semirremolques
 */
export const getAllSemirremolques = async (): Promise<Semirremolque[]> => {
  const { data, error } = await supabase
    .from('semirremolques')
    .select('*')
    .order('nombre', { ascending: true });
  
  if (error) {
    console.error('Error al obtener semirremolques:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener un semirremolque por ID
 * @param id ID del semirremolque
 * @returns Promise con el semirremolque o null si no existe
 */
export const getSemirremolqueById = async (id: string): Promise<Semirremolque | null> => {
  const { data, error } = await supabase
    .from('semirremolques')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error al obtener semirremolque por ID:', error);
    return null;
  }
  
  return data;
};

/**
 * Crear un nuevo semirremolque
 * @param semirremolque Datos del semirremolque (sin ID)
 * @returns Promise con el semirremolque creado
 */
export const createSemirremolque = async (semirremolque: Omit<Semirremolque, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Semirremolque> => {
  // Verificar si el dominio ya existe
  const { data: existingDominio } = await supabase
    .from('semirremolques')
    .select('id')
    .eq('dominio', semirremolque.dominio)
    .single();
  
  if (existingDominio) {
    throw new Error('Ya existe un semirremolque con ese dominio');
  }
  
  // Preparar los datos para la creación
  const createData = { ...semirremolque };
  
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
    const value = createData[campo as keyof typeof createData];
    if (value && (typeof value === 'string' || typeof value === 'number')) {
      (createData as any)[campo] = new Date(value).toISOString();
    }
  });
  
  // Crear el semirremolque
  const { data, error } = await supabase
    .from('semirremolques')
    .insert(createData)
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear semirremolque:', error);
    throw error;
  }
  
  return data;
};

/**
 * Actualizar un semirremolque existente
 * @param id ID del semirremolque a actualizar
 * @param semirremolqueData Datos actualizados del semirremolque
 * @returns Promise con el semirremolque actualizado o null si no existe
 */
export const updateSemirremolque = async (
  id: string, 
  semirremolqueData: Partial<Omit<Semirremolque, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Semirremolque | null> => {
  // Verificar si el semirremolque existe
  const { data: existingSemirremolque } = await supabase
    .from('semirremolques')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingSemirremolque) {
    return null;
  }
  
  // Verificar si el dominio está siendo actualizado y ya existe
  if (semirremolqueData.dominio && semirremolqueData.dominio !== existingSemirremolque.dominio) {
    const { data: existingDominio } = await supabase
      .from('semirremolques')
      .select('id')
      .eq('dominio', semirremolqueData.dominio)
      .single();
    
    if (existingDominio && existingDominio.id !== id) {
      throw new Error('Ya existe un semirremolque con ese dominio');
    }
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
  const { data, error } = await supabase
    .from('semirremolques')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar semirremolque:', error);
    throw error;
  }
  
  return data;
};

/**
 * Eliminar un semirremolque por ID
 * @param id ID del semirremolque a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteSemirremolque = async (id: string): Promise<boolean> => {
  // Verificar si el semirremolque existe
  const { data: existingSemirremolque } = await supabase
    .from('semirremolques')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingSemirremolque) {
    return false;
  }
  
  // Eliminar el semirremolque
  const { error } = await supabase
    .from('semirremolques')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar semirremolque:', error);
    throw error;
  }
  
  return true;
};

/**
 * Buscar semirremolques por nombre o dominio
 * @param query Texto de búsqueda
 * @returns Promise con array de semirremolques que coinciden con la búsqueda
 */
export const searchSemirremolques = async (query: string): Promise<Semirremolque[]> => {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('semirremolques')
    .select('*')
    .or(`nombre.ilike.${searchTerm},dominio.ilike.${searchTerm}`);
  
  if (error) {
    console.error('Error al buscar semirremolques:', error);
    throw error;
  }
  
  return data || [];
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
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasLimite);
  
  const { data, error } = await supabase
    .from('semirremolques')
    .select('*')
    .lt(campo, fechaLimite.toISOString())
    .gt(campo, new Date().toISOString())
    .order(campo, { ascending: true });
  
  if (error) {
    console.error(`Error al obtener semirremolques con ${campo} próximo a vencer:`, error);
    throw error;
  }
  
  return data || [];
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
  const { data, error } = await supabase
    .from('semirremolques')
    .select('*')
    .lt(campo, new Date().toISOString())
    .order(campo, { ascending: false });
  
  if (error) {
    console.error(`Error al obtener semirremolques con ${campo} vencido:`, error);
    throw error;
  }
  
  return data || [];
};
