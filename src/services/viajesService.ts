import { supabase } from '../utils/supabase';

export interface Viaje {
  id: string;
  chofer_id: string;
  tractor_id: string;
  semirremolque_id: string;
  tipo_servicio: string;
  fecha_salida: string;
  fecha_llegada: string | null;
  origen: string;
  destino: string;
  kilometros_recorridos: number | null;
  duracion_horas: number | null;
  alcance_servicio: 'Nacional' | 'Internacional';
  estado_viaje: 'Programado' | 'En curso' | 'Finalizado' | 'Cancelado';
  observaciones: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/**
 * Obtener todos los viajes
 * @returns Promise con array de viajes
 */
export const getAllViajes = async (): Promise<Viaje[]> => {
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .order('fecha_salida', { ascending: false });
  
  if (error) {
    console.error('Error al obtener viajes:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener un viaje por ID
 * @param id ID del viaje
 * @returns Promise con el viaje o null si no existe
 */
export const getViajeById = async (id: string): Promise<Viaje | null> => {
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error al obtener viaje por ID:', error);
    return null;
  }
  
  return data;
};

/**
 * Crear un nuevo viaje
 * @param viaje Datos del viaje (sin ID)
 * @returns Promise con el viaje creado
 */
export const createViaje = async (viaje: Omit<Viaje, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Viaje> => {
  // Calcular duración en horas si hay fecha de salida y llegada
  let duracionHoras = null;
  if (viaje.fecha_salida && viaje.fecha_llegada) {
    const salida = new Date(viaje.fecha_salida);
    const llegada = new Date(viaje.fecha_llegada);
    duracionHoras = (llegada.getTime() - salida.getTime()) / (1000 * 60 * 60);
  }
  
  // Crear el viaje
  const { data, error } = await supabase
    .from('viajes')
    .insert({
      ...viaje,
      duracion_horas: duracionHoras,
      fecha_salida: viaje.fecha_salida ? new Date(viaje.fecha_salida).toISOString() : null,
      fecha_llegada: viaje.fecha_llegada ? new Date(viaje.fecha_llegada).toISOString() : null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear viaje:', error);
    throw error;
  }
  
  return data;
};

/**
 * Actualizar un viaje existente
 * @param id ID del viaje a actualizar
 * @param viajeData Datos actualizados del viaje
 * @returns Promise con el viaje actualizado o null si no existe
 */
export const updateViaje = async (
  id: string, 
  viajeData: Partial<Omit<Viaje, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Viaje | null> => {
  // Verificar si el viaje existe
  const { data: existingViaje } = await supabase
    .from('viajes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingViaje) {
    return null;
  }
  
  // Preparar los datos para la actualización
  const updateData = { ...viajeData };
  
  // Convertir fechas a formato ISO si existen
  if (updateData.fecha_salida) {
    updateData.fecha_salida = new Date(updateData.fecha_salida).toISOString();
  }
  
  if (updateData.fecha_llegada) {
    updateData.fecha_llegada = new Date(updateData.fecha_llegada).toISOString();
  }
  
  // Calcular duración en horas si hay cambios en las fechas
  const fechaSalida = updateData.fecha_salida || existingViaje.fecha_salida;
  const fechaLlegada = updateData.fecha_llegada || existingViaje.fecha_llegada;
  
  if (fechaSalida && fechaLlegada) {
    const salida = new Date(fechaSalida);
    const llegada = new Date(fechaLlegada);
    updateData.duracion_horas = (llegada.getTime() - salida.getTime()) / (1000 * 60 * 60);
  }
  
  // Actualizar el viaje
  const { data, error } = await supabase
    .from('viajes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar viaje:', error);
    throw error;
  }
  
  return data;
};

/**
 * Eliminar un viaje por ID
 * @param id ID del viaje a eliminar
 * @returns Promise con true si se eliminó correctamente, false si no existe
 */
export const deleteViaje = async (id: string): Promise<boolean> => {
  // Verificar si el viaje existe
  const { data: existingViaje } = await supabase
    .from('viajes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!existingViaje) {
    return false;
  }
  
  // Eliminar el viaje
  const { error } = await supabase
    .from('viajes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar viaje:', error);
    throw error;
  }
  
  return true;
};

/**
 * Cambiar el estado de un viaje
 * @param id ID del viaje
 * @param estado Nuevo estado del viaje
 * @returns Promise con el viaje actualizado o null si no existe
 */
export const cambiarEstadoViaje = async (
  id: string, 
  estado: 'Programado' | 'En curso' | 'Finalizado' | 'Cancelado'
): Promise<Viaje | null> => {
  return updateViaje(id, { estado_viaje: estado });
};

/**
 * Buscar viajes por origen, destino o estado
 * @param query Texto de búsqueda
 * @returns Promise con array de viajes que coinciden con la búsqueda
 */
export const searchViajes = async (query: string): Promise<Viaje[]> => {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .or(`origen.ilike.${searchTerm},destino.ilike.${searchTerm},estado_viaje.ilike.${searchTerm}`)
    .order('fecha_salida', { ascending: false });
  
  if (error) {
    console.error('Error al buscar viajes:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener viajes por chofer
 * @param choferId ID del chofer
 * @returns Promise con array de viajes del chofer
 */
export const getViajesByChofer = async (choferId: string): Promise<Viaje[]> => {
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .eq('chofer_id', choferId)
    .order('fecha_salida', { ascending: false });
  
  if (error) {
    console.error('Error al obtener viajes por chofer:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener viajes por tractor
 * @param tractorId ID del tractor
 * @returns Promise con array de viajes del tractor
 */
export const getViajesByTractor = async (tractorId: string): Promise<Viaje[]> => {
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .eq('tractor_id', tractorId)
    .order('fecha_salida', { ascending: false });
  
  if (error) {
    console.error('Error al obtener viajes por tractor:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener viajes por semirremolque
 * @param semirremolqueId ID del semirremolque
 * @returns Promise con array de viajes del semirremolque
 */
export const getViajesBySemirremolque = async (semirremolqueId: string): Promise<Viaje[]> => {
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .eq('semirremolque_id', semirremolqueId)
    .order('fecha_salida', { ascending: false });
  
  if (error) {
    console.error('Error al obtener viajes por semirremolque:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener viajes por estado
 * @param estado Estado del viaje
 * @returns Promise con array de viajes con el estado especificado
 */
export const getViajesByEstado = async (estado: 'Programado' | 'En curso' | 'Finalizado' | 'Cancelado'): Promise<Viaje[]> => {
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .eq('estado_viaje', estado)
    .order('fecha_salida', { ascending: false });
  
  if (error) {
    console.error('Error al obtener viajes por estado:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Obtener viajes por rango de fechas
 * @param fechaInicio Fecha de inicio del rango
 * @param fechaFin Fecha de fin del rango
 * @returns Promise con array de viajes dentro del rango de fechas
 */
export const getViajesByFechas = async (fechaInicio: string, fechaFin: string): Promise<Viaje[]> => {
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .gte('fecha_salida', new Date(fechaInicio).toISOString())
    .lte('fecha_salida', new Date(fechaFin).toISOString())
    .order('fecha_salida', { ascending: false });
  
  if (error) {
    console.error('Error al obtener viajes por rango de fechas:', error);
    throw error;
  }
  
  return data || [];
};
