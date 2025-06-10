import { supabase, Servicio } from '../utils/supabase';

/**
 * Obtener todos los servicios
 * @returns Promise con array de servicios
 */
export const getAllServicios = async (): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .order('fecha_inicio', { ascending: false });
  
  if (error) {
    console.error('Error al obtener servicios:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener un servicio por ID
 * @param id ID del servicio
 * @returns Promise con el servicio o null si no existe
 */
export const getServicioById = async (id: string): Promise<Servicio | null> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error al obtener servicio por ID:', error);
    return null;
  }
  
  return data;
};

/**
 * Crear un nuevo servicio
 * @param servicio Datos del servicio (sin ID)
 * @returns Promise con el servicio creado
 */
export const createServicio = async (servicio: Omit<Servicio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Servicio> => {
  // Preparar los datos para la creación
  const createData = { ...servicio };
  
  // Convertir las fechas a formato ISO
  if (createData.fecha_inicio && (typeof createData.fecha_inicio === 'string' || typeof createData.fecha_inicio === 'number')) {
    createData.fecha_inicio = new Date(createData.fecha_inicio).toISOString();
  }
  
  if (createData.fecha_fin && (typeof createData.fecha_fin === 'string' || typeof createData.fecha_fin === 'number')) {
    createData.fecha_fin = new Date(createData.fecha_fin).toISOString();
  }
  
  // Crear el servicio
  const { data, error } = await supabase
    .from('servicios')
    .insert(createData)
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .single();
  
  if (error) {
    console.error('Error al crear servicio:', error);
    throw error;
  }
  
  return data;
};

/**
 * Actualizar un servicio existente
 * @param id ID del servicio a actualizar
 * @param servicioData Datos actualizados del servicio
 * @returns Promise con el servicio actualizado o null si no existe
 */
export const updateServicio = async (
  id: string, 
  servicioData: Partial<Omit<Servicio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Servicio | null> => {
  // Verificar si el servicio existe
  const { data: existingServicio } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingServicio) {
    return null;
  }
  
  // Preparar los datos para la actualización
  const updateData = { ...servicioData };
  
  // Convertir las fechas a formato ISO
  if (updateData.fecha_inicio && (typeof updateData.fecha_inicio === 'string' || typeof updateData.fecha_inicio === 'number')) {
    updateData.fecha_inicio = new Date(updateData.fecha_inicio).toISOString();
  }
  
  if (updateData.fecha_fin && (typeof updateData.fecha_fin === 'string' || typeof updateData.fecha_fin === 'number')) {
    updateData.fecha_fin = new Date(updateData.fecha_fin).toISOString();
  }
  
  // Actualizar el servicio
  const { data, error } = await supabase
    .from('servicios')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .single();
  
  if (error) {
    console.error('Error al actualizar servicio:', error);
    throw error;
  }
  
  return data;
};

/**
 * Eliminar un servicio por ID
 * @param id ID del servicio a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteServicio = async (id: string): Promise<boolean> => {
  // Verificar si el servicio existe
  const { data: existingServicio } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingServicio) {
    return false;
  }
  
  // Eliminar el servicio
  const { error } = await supabase
    .from('servicios')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar servicio:', error);
    throw error;
  }
  
  return true;
};

/**
 * Buscar servicios por origen, destino o número de remito
 * @param query Texto de búsqueda
 * @returns Promise con array de servicios que coinciden con la búsqueda
 */
export const searchServicios = async (query: string): Promise<Servicio[]> => {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .or(`origen.ilike.${searchTerm},destino.ilike.${searchTerm},numero_remito.ilike.${searchTerm}`);
  
  if (error) {
    console.error('Error al buscar servicios:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por rango de fechas
 * @param fechaInicio Fecha de inicio del rango
 * @param fechaFin Fecha de fin del rango
 * @returns Promise con array de servicios en el rango de fechas
 */
export const getServiciosPorRangoFechas = async (fechaInicio: Date, fechaFin: Date): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .gte('fecha_inicio', fechaInicio.toISOString())
    .lte('fecha_inicio', fechaFin.toISOString())
    .order('fecha_inicio', { ascending: false });
  
  if (error) {
    console.error('Error al obtener servicios por rango de fechas:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por estado
 * @param estado Estado del servicio
 * @returns Promise con array de servicios con el estado especificado
 */
export const getServiciosPorEstado = async (estado: 'pendiente' | 'en_curso' | 'completado' | 'cancelado'): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .eq('estado', estado)
    .order('fecha_inicio', { ascending: false });
  
  if (error) {
    console.error(`Error al obtener servicios con estado ${estado}:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por chofer
 * @param choferId ID del chofer
 * @returns Promise con array de servicios del chofer especificado
 */
export const getServiciosPorChofer = async (choferId: string): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .eq('chofer_id', choferId)
    .order('fecha_inicio', { ascending: false });
  
  if (error) {
    console.error(`Error al obtener servicios del chofer ${choferId}:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por tractor
 * @param tractorId ID del tractor
 * @returns Promise con array de servicios del tractor especificado
 */
export const getServiciosPorTractor = async (tractorId: string): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .eq('tractor_id', tractorId)
    .order('fecha_inicio', { ascending: false });
  
  if (error) {
    console.error(`Error al obtener servicios del tractor ${tractorId}:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por semirremolque
 * @param semirremolqueId ID del semirremolque
 * @returns Promise con array de servicios del semirremolque especificado
 */
export const getServiciosPorSemirremolque = async (semirremolqueId: string): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *,
      chofer:chofer_id(*),
      tractor:tractor_id(*),
      semirremolque:semirremolque_id(*)
    `)
    .eq('semirremolque_id', semirremolqueId)
    .order('fecha_inicio', { ascending: false });
  
  if (error) {
    console.error(`Error al obtener servicios del semirremolque ${semirremolqueId}:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Actualizar el estado de un servicio
 * @param id ID del servicio
 * @param estado Nuevo estado del servicio
 * @returns Promise con el servicio actualizado o null si no existe
 */
export const updateEstadoServicio = async (
  id: string, 
  estado: 'pendiente' | 'en_curso' | 'completado' | 'cancelado'
): Promise<Servicio | null> => {
  return updateServicio(id, { estado });
};

/**
 * Completar un servicio
 * @param id ID del servicio
 * @param fechaFin Fecha de finalización del servicio
 * @param observaciones Observaciones opcionales sobre la finalización
 * @returns Promise con el servicio actualizado o null si no existe
 */
export const completarServicio = async (
  id: string,
  fechaFin: Date | string,
  observaciones?: string
): Promise<Servicio | null> => {
  return updateServicio(id, { 
    estado: 'completado', 
    fecha_fin: typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString(),
    observaciones: observaciones || undefined
  });
};

/**
 * Cancelar un servicio
 * @param id ID del servicio
 * @param motivo Motivo de la cancelación
 * @returns Promise con el servicio actualizado o null si no existe
 */
export const cancelarServicio = async (
  id: string,
  motivo: string
): Promise<Servicio | null> => {
  return updateServicio(id, { 
    estado: 'cancelado', 
    observaciones: motivo
  });
};
