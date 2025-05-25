// Define the Semirremolque type
export interface Semirremolque {
  id: string;
  nombre: string; // Tipo o modelo del semirremolque
  dominio: string; // Patente del semirremolque
  año: number;
  estado: 'Disponible' | 'En uso' | 'En reparación' | string;
  tipoServicio: string; // Tipo de servicio que realiza
  alcanceServicio: 'Nacional' | 'Internacional';
  vencimientoRTO: string; // Revisión Técnica Obligatoria general
  vencimientoVisualExterna?: string; // Inspección visual externa del tanque
  vencimientoVisualInterna?: string; // Inspección visual interna del tanque
  vencimientoEspesores?: string; // Medición de espesores del tanque
  vencimientoPruebaHidraulica?: string; // Prueba hidráulica del recipiente
  vencimientoMangueras?: string; // Control y vencimiento de mangueras
  vencimientoValvulaFlujo?: string; // Control o recambio de válvula de flujo
  observaciones?: string; // Campo para registrar notas técnicas o condiciones especiales
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Mock data for initial semirremolques
const initialSemirremolques: Semirremolque[] = [
  {
    id: '1',
    nombre: 'Cisterna para GLP',
    dominio: 'AA123BB',
    año: 2019,
    estado: 'Disponible',
    tipoServicio: 'Transporte de GLP',
    alcanceServicio: 'Nacional',
    vencimientoRTO: '2024-08-15',
    vencimientoPruebaHidraulica: '2025-01-20',
    vencimientoMangueras: '2024-06-10',
    vencimientoValvulaFlujo: '2024-11-30',
    observaciones: 'Cisterna en buen estado, última prueba hidráulica satisfactoria',
    fechaCreacion: '2023-04-10',
    fechaActualizacion: '2024-01-20'
  },
  {
    id: '2',
    nombre: 'Cisterna para combustibles líquidos',
    dominio: 'AC456DE',
    año: 2020,
    estado: 'En uso',
    tipoServicio: 'Transporte de combustibles líquidos',
    alcanceServicio: 'Nacional',
    vencimientoRTO: '2024-09-25',
    vencimientoVisualExterna: '2024-07-15',
    vencimientoVisualInterna: '2024-07-15',
    vencimientoEspesores: '2025-02-10',
    observaciones: 'Última inspección visual sin observaciones',
    fechaCreacion: '2023-06-15',
    fechaActualizacion: '2024-02-10'
  },
  {
    id: '3',
    nombre: 'Cisterna para metanol',
    dominio: 'AD789FG',
    año: 2021,
    estado: 'En reparación',
    tipoServicio: 'Transporte de metanol',
    alcanceServicio: 'Internacional',
    vencimientoRTO: '2024-11-05',
    vencimientoVisualExterna: '2024-10-20',
    vencimientoVisualInterna: '2024-10-20',
    vencimientoEspesores: '2025-04-15',
    observaciones: 'En taller por reparación de válvulas',
    fechaCreacion: '2023-08-20',
    fechaActualizacion: '2024-03-05'
  }
];

// Storage key for localStorage
const SEMIRREMOLQUES_STORAGE_KEY = 'semirremolques_data';

/**
 * Initialize the semirremolques data in localStorage if it doesn't exist
 */
const initializeSemirremolques = (): void => {
  if (!localStorage.getItem(SEMIRREMOLQUES_STORAGE_KEY)) {
    localStorage.setItem(SEMIRREMOLQUES_STORAGE_KEY, JSON.stringify(initialSemirremolques));
  }
};

/**
 * Get all semirremolques
 * @returns Array of all semirremolques
 */
export const getAllSemirremolques = (): Semirremolque[] => {
  initializeSemirremolques();
  const data = localStorage.getItem(SEMIRREMOLQUES_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Get a semirremolque by ID
 * @param id Semirremolque ID
 * @returns Semirremolque object or null if not found
 */
export const getSemirremolqueById = (id: string): Semirremolque | null => {
  const semirremolques = getAllSemirremolques();
  return semirremolques.find(semirremolque => semirremolque.id === id) || null;
};

/**
 * Create a new semirremolque
 * @param semirremolque Semirremolque data (without ID)
 * @returns The created semirremolque with ID
 */
export const createSemirremolque = (semirremolque: Omit<Semirremolque, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Semirremolque => {
  const semirremolques = getAllSemirremolques();
  
  // Generate a new ID (in a real app, this would be handled by the backend)
  const newId = (Math.max(...semirremolques.map(s => parseInt(s.id)), 0) + 1).toString();
  
  const now = new Date().toISOString().split('T')[0];
  
  const newSemirremolque: Semirremolque = {
    ...semirremolque,
    id: newId,
    fechaCreacion: now,
    fechaActualizacion: now
  };
  
  // Add to the list and save
  const updatedSemirremolques = [...semirremolques, newSemirremolque];
  localStorage.setItem(SEMIRREMOLQUES_STORAGE_KEY, JSON.stringify(updatedSemirremolques));
  
  return newSemirremolque;
};

/**
 * Update an existing semirremolque
 * @param id Semirremolque ID to update
 * @param semirremolqueData Updated semirremolque data
 * @returns Updated semirremolque or null if not found
 */
export const updateSemirremolque = (id: string, semirremolqueData: Partial<Omit<Semirremolque, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>): Semirremolque | null => {
  const semirremolques = getAllSemirremolques();
  const index = semirremolques.findIndex(semirremolque => semirremolque.id === id);
  
  if (index === -1) return null;
  
  // Update the semirremolque
  const updatedSemirremolque: Semirremolque = {
    ...semirremolques[index],
    ...semirremolqueData,
    fechaActualizacion: new Date().toISOString().split('T')[0]
  };
  
  semirremolques[index] = updatedSemirremolque;
  localStorage.setItem(SEMIRREMOLQUES_STORAGE_KEY, JSON.stringify(semirremolques));
  
  return updatedSemirremolque;
};

/**
 * Delete a semirremolque by ID
 * @param id Semirremolque ID to delete
 * @returns true if deleted, false if not found
 */
export const deleteSemirremolque = (id: string): boolean => {
  const semirremolques = getAllSemirremolques();
  const filteredSemirremolques = semirremolques.filter(semirremolque => semirremolque.id !== id);
  
  if (filteredSemirremolques.length === semirremolques.length) {
    return false; // Semirremolque not found
  }
  
  localStorage.setItem(SEMIRREMOLQUES_STORAGE_KEY, JSON.stringify(filteredSemirremolques));
  return true;
};

/**
 * Toggle a semirremolque's availability status between 'Disponible' and 'En reparación'
 * @param id Semirremolque ID
 * @returns Updated semirremolque or null if not found
 */
export const toggleSemirremolqueStatus = (id: string): Semirremolque | null => {
  const semirremolque = getSemirremolqueById(id);
  if (!semirremolque) return null;
  
  const newEstado = semirremolque.estado === 'Disponible' ? 'En reparación' : 'Disponible';
  return updateSemirremolque(id, { estado: newEstado });
};

/**
 * Search semirremolques by nombre, dominio, or tipoServicio
 * @param query Search query
 * @returns Array of matching semirremolques
 */
export const searchSemirremolques = (query: string): Semirremolque[] => {
  if (!query.trim()) return getAllSemirremolques();
  
  const semirremolques = getAllSemirremolques();
  const lowerQuery = query.toLowerCase();
  
  return semirremolques.filter(semirremolque => 
    semirremolque.nombre.toLowerCase().includes(lowerQuery) ||
    semirremolque.dominio.toLowerCase().includes(lowerQuery) ||
    semirremolque.tipoServicio.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Reset to initial data (useful for testing or resetting the app)
 */
export const resetSemirremolquesData = (): void => {
  localStorage.setItem(SEMIRREMOLQUES_STORAGE_KEY, JSON.stringify(initialSemirremolques));
};
