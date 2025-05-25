// Define the Servicio type
export interface Servicio {
  id: string;
  nombre: string; // Nombre del servicio (Ej: Transporte de combustibles líquidos, GLP, metanol)
  descripcion?: string; // Detalle del servicio si se desea ampliar
  requierePruebaHidraulica: boolean; // Indica si el servicio requiere prueba hidráulica
  requiereVisuales: boolean; // Indica si requiere inspección visual externa/interna y control de espesores
  requiereValvulaYMangueras: boolean; // Para servicios que implican presión y requieren mantenimiento de válvulas y mangueras
  observaciones?: string; // Campo opcional para registrar comentarios técnicos o administrativos
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Mock data for initial servicios
const initialServicios: Servicio[] = [
  {
    id: '1',
    nombre: 'Transporte de combustibles líquidos',
    descripcion: 'Transporte nacional de combustibles líquidos en cisternas',
    requierePruebaHidraulica: false,
    requiereVisuales: true,
    requiereValvulaYMangueras: false,
    observaciones: 'Requiere inspecciones visuales periódicas y control de espesores',
    fechaCreacion: '2024-01-15',
    fechaActualizacion: '2024-01-15'
  },
  {
    id: '2',
    nombre: 'Transporte de GLP',
    descripcion: 'Transporte nacional e internacional de GLP en cisternas presurizadas',
    requierePruebaHidraulica: true,
    requiereVisuales: true,
    requiereValvulaYMangueras: true,
    observaciones: 'Requiere prueba hidráulica, inspecciones visuales y control de válvulas y mangueras',
    fechaCreacion: '2024-02-10',
    fechaActualizacion: '2024-02-10'
  },
  {
    id: '3',
    nombre: 'Transporte de metanol',
    descripcion: 'Transporte nacional de metanol',
    requierePruebaHidraulica: false,
    requiereVisuales: true,
    requiereValvulaYMangueras: false,
    fechaCreacion: '2024-03-05',
    fechaActualizacion: '2024-03-20'
  }
];

// Storage key for localStorage
const SERVICIOS_STORAGE_KEY = 'servicios_data';

/**
 * Initialize the servicios data in localStorage if it doesn't exist
 */
const initializeServicios = (): void => {
  if (!localStorage.getItem(SERVICIOS_STORAGE_KEY)) {
    localStorage.setItem(SERVICIOS_STORAGE_KEY, JSON.stringify(initialServicios));
  }
};

/**
 * Get all servicios
 * @returns Array of all servicios
 */
export const getAllServicios = (): Servicio[] => {
  initializeServicios();
  const data = localStorage.getItem(SERVICIOS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Get a servicio by ID
 * @param id Servicio ID
 * @returns Servicio object or null if not found
 */
export const getServicioById = (id: string): Servicio | null => {
  const servicios = getAllServicios();
  return servicios.find(servicio => servicio.id === id) || null;
};

/**
 * Create a new servicio
 * @param servicio Servicio data (without ID)
 * @returns The created servicio with ID
 */
export const createServicio = (servicio: Omit<Servicio, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Servicio => {
  const servicios = getAllServicios();
  
  // Generate a new ID (in a real app, this would be handled by the backend)
  const newId = (Math.max(...servicios.map(s => parseInt(s.id)), 0) + 1).toString();
  
  const now = new Date().toISOString().split('T')[0];
  
  const newServicio: Servicio = {
    ...servicio,
    id: newId,
    fechaCreacion: now,
    fechaActualizacion: now
  };
  
  // Add to the list and save
  const updatedServicios = [...servicios, newServicio];
  localStorage.setItem(SERVICIOS_STORAGE_KEY, JSON.stringify(updatedServicios));
  
  return newServicio;
};

/**
 * Update an existing servicio
 * @param id Servicio ID to update
 * @param servicioData Updated servicio data
 * @returns Updated servicio or null if not found
 */
export const updateServicio = (id: string, servicioData: Partial<Omit<Servicio, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>): Servicio | null => {
  const servicios = getAllServicios();
  const index = servicios.findIndex(servicio => servicio.id === id);
  
  if (index === -1) return null;
  
  // Update the servicio
  const updatedServicio: Servicio = {
    ...servicios[index],
    ...servicioData,
    fechaActualizacion: new Date().toISOString().split('T')[0]
  };
  
  servicios[index] = updatedServicio;
  localStorage.setItem(SERVICIOS_STORAGE_KEY, JSON.stringify(servicios));
  
  return updatedServicio;
};

/**
 * Delete a servicio by ID
 * @param id Servicio ID to delete
 * @returns true if deleted, false if not found
 */
export const deleteServicio = (id: string): boolean => {
  const servicios = getAllServicios();
  const filteredServicios = servicios.filter(servicio => servicio.id !== id);
  
  if (filteredServicios.length === servicios.length) {
    return false; // Servicio not found
  }
  
  localStorage.setItem(SERVICIOS_STORAGE_KEY, JSON.stringify(filteredServicios));
  return true;
};

/**
 * Toggle a servicio's requirement for prueba hidraulica
 * @param id Servicio ID
 * @returns Updated servicio or null if not found
 */
export const toggleServicioRequirePruebaHidraulica = (id: string): Servicio | null => {
  const servicio = getServicioById(id);
  if (!servicio) return null;
  
  return updateServicio(id, { requierePruebaHidraulica: !servicio.requierePruebaHidraulica });
};

/**
 * Search servicios by name or description
 * @param query Search query
 * @returns Array of matching servicios
 */
export const searchServicios = (query: string): Servicio[] => {
  if (!query.trim()) return getAllServicios();
  
  const servicios = getAllServicios();
  const lowerQuery = query.toLowerCase();
  
  return servicios.filter(servicio => 
    servicio.nombre.toLowerCase().includes(lowerQuery) ||
    (servicio.descripcion && servicio.descripcion.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Reset to initial data (useful for testing or resetting the app)
 */
export const resetServiciosData = (): void => {
  localStorage.setItem(SERVICIOS_STORAGE_KEY, JSON.stringify(initialServicios));
};
