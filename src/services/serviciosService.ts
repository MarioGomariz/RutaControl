import { supabase, Servicio } from '../utils/supabase';

/**
 * Obtener todos los servicios
 * @returns Promise con array de servicios
 */
export const getAllServicios = async (): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *
    `)
    .order('fecha_creacion', { ascending: false });
  
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
      *
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
  
  // Crear el servicio
  const { data, error } = await supabase
    .from('servicios')
    .insert(createData)
    .select(`
      *
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
  
  // Actualizar el servicio
  const { data, error } = await supabase
    .from('servicios')
    .update(updateData)
    .eq('id', id)
    .select(`
      *
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
 * Buscar servicios por nombre, descripcion o número de remito
 * @param query Texto de búsqueda
 * @returns Promise con array de servicios que coinciden con la búsqueda
 */
export const searchServicios = async (query: string): Promise<Servicio[]> => {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *
    `)
    .or(`nombre.ilike.${searchTerm},descripcion.ilike.${searchTerm},observaciones.ilike.${searchTerm}`);
  
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
export const getServiciosPorFechaCreacion = async (fechaInicio: Date, fechaFin: Date): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *
    `)
    .gte('fecha_creacion', fechaInicio.toISOString())
    .lte('fecha_creacion', fechaFin.toISOString())
    .order('fecha_creacion', { ascending: false });
  
  if (error) {
    console.error('Error al obtener servicios por rango de fechas:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por observaciones
 * @param observaciones Estado del servicio
 * @returns Promise con array de servicios con el observaciones especificado
 */
export const getServiciosPorTipo = async (nombre: string): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *
    `)
    .eq('nombre', nombre)
    .order('fecha_creacion', { ascending: false });
  
  if (error) {
    console.error(`Error al obtener servicios con nombre ${nombre}:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por chofer
 * @param choferId ID del chofer
 * @returns Promise con array de servicios del chofer especificado
 */
export const getServiciosPorRequerimiento = async (requiere: boolean): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *
    `)
    .eq('requierePruebaHidraulica', requiere)
    .order('fecha_creacion', { ascending: false });
  
  if (error) {
    console.error(`Error al obtener servicios con requerimiento de prueba hidráulica:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por tractor
 * @param tractorId ID del tractor
 * @returns Promise con array de servicios del tractor especificado
 */
export const getServiciosPorVisual = async (requiere: boolean): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *
    `)
    .eq('requiereVisuales', requiere)
    .order('fecha_creacion', { ascending: false });
  
  if (error) {
    console.error(`Error al obtener servicios con requerimiento de visuales:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener servicios por semirremolque
 * @param semirremolqueId ID del semirremolque
 * @returns Promise con array de servicios del semirremolque especificado
 */
export const getServiciosPorValvula = async (requiere: boolean): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('servicios')
    .select(`
      *
    `)
    .eq('requiereValvulaYMangueras', requiere)
    .order('fecha_creacion', { ascending: false });
  
  if (error) {
    console.error(`Error al obtener servicios con requerimiento de válvulas y mangueras:`, error);
    throw error;
  }
  
  return data || [];
};

/**
 * Actualizar el observaciones de un servicio
 * @param id ID del servicio
 * @param observaciones Nuevo observaciones del servicio
 * @returns Promise con el servicio actualizado o null si no existe
 */
export const updateObservacionesServicio = async (
  id: string, 
  observaciones: string
): Promise<Servicio | null> => {
  return updateServicio(id, { observaciones });
};

/**
 * Completar un servicio
 * @param id ID del servicio
 * @param fechaFin Fecha de finalización del servicio
 * @param observaciones Observaciones opcionales sobre la finalización
 * @returns Promise con el servicio actualizado o null si no existe
 */
export const actualizarServicio = async (
  id: string,
  descripcion: string,
  observaciones?: string
): Promise<Servicio | null> => {
  return updateServicio(id, { 
    descripcion,
    observaciones: observaciones || undefined
  });
};

/**
 * Cancelar un servicio
 * @param id ID del servicio
 * @param motivo Motivo de la cancelación
 * @returns Promise con el servicio actualizado o null si no existe
 */
export const agregarObservacionServicio = async (
  id: string,
  observacion: string
): Promise<Servicio | null> => {
  const servicio = await getServicioById(id);
  if (!servicio) return null;
  
  const observaciones = servicio.observaciones 
    ? `${servicio.observaciones}\n${observacion}` 
    : observacion;
  
  return updateServicio(id, { observaciones });
};
