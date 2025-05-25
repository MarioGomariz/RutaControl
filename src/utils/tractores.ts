// Define the Tractor type
export interface Tractor {
  id: string;
  marca: string;
  modelo: string;
  dominio: string; // patente
  año: number;
  vencimientoRTO: string; // fecha de vencimiento de la Revisión Técnica Obligatoria
  estado: 'Disponible' | 'En reparación' | 'En viaje' | string; // Estado actual
  tipoServicio: string; // Tipo de servicio que realiza
  alcanceServicio: 'Nacional' | 'Internacional'; // Ámbito del servicio
  observaciones?: string; // Campo opcional para registrar notas técnicas, daños, etc.
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Mock data for initial tractores
const initialTractores: Tractor[] = [
  {
    id: '1',
    marca: 'Scania',
    modelo: 'R450',
    dominio: 'AB123CD',
    año: 2020,
    vencimientoRTO: '2024-07-10',
    estado: 'Disponible',
    tipoServicio: 'Transporte de combustibles líquidos',
    alcanceServicio: 'Nacional',
    observaciones: 'Camión en excelentes condiciones',
    fechaCreacion: '2023-05-15',
    fechaActualizacion: '2024-01-15'
  },
  {
    id: '2',
    marca: 'Volvo',
    modelo: 'FH16',
    dominio: 'XY789ZW',
    año: 2021,
    vencimientoRTO: '2024-08-20',
    estado: 'En viaje',
    tipoServicio: 'Transporte de GLP',
    alcanceServicio: 'Internacional',
    fechaCreacion: '2023-08-10',
    fechaActualizacion: '2024-02-25'
  },
  {
    id: '3',
    marca: 'Mercedes-Benz',
    modelo: 'Actros',
    dominio: 'LM456OP',
    año: 2019,
    vencimientoRTO: '2024-05-05',
    estado: 'En reparación',
    tipoServicio: 'Transporte de metanol',
    alcanceServicio: 'Nacional',
    observaciones: 'En taller por problemas en el sistema de frenos',
    fechaCreacion: '2022-12-01',
    fechaActualizacion: '2024-03-10'
  }
];

// Storage key for localStorage
const TRACTORES_STORAGE_KEY = 'tractores_data';

/**
 * Initialize the tractores data in localStorage if it doesn't exist
 */
const initializeTractores = (): void => {
  if (!localStorage.getItem(TRACTORES_STORAGE_KEY)) {
    localStorage.setItem(TRACTORES_STORAGE_KEY, JSON.stringify(initialTractores));
  }
};

/**
 * Get all tractores
 * @returns Array of all tractores
 */
export const getAllTractores = (): Tractor[] => {
  initializeTractores();
  const data = localStorage.getItem(TRACTORES_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Get a tractor by ID
 * @param id Tractor ID
 * @returns Tractor object or null if not found
 */
export const getTractorById = (id: string): Tractor | null => {
  const tractores = getAllTractores();
  return tractores.find(tractor => tractor.id === id) || null;
};

/**
 * Create a new tractor
 * @param tractor Tractor data (without ID)
 * @returns The created tractor with ID
 */
export const createTractor = (tractor: Omit<Tractor, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Tractor => {
  const tractores = getAllTractores();
  
  // Generate a new ID (in a real app, this would be handled by the backend)
  const newId = (Math.max(...tractores.map(t => parseInt(t.id)), 0) + 1).toString();
  
  const now = new Date().toISOString().split('T')[0];
  
  const newTractor: Tractor = {
    ...tractor,
    id: newId,
    fechaCreacion: now,
    fechaActualizacion: now
  };
  
  // Add to the list and save
  const updatedTractores = [...tractores, newTractor];
  localStorage.setItem(TRACTORES_STORAGE_KEY, JSON.stringify(updatedTractores));
  
  return newTractor;
};

/**
 * Update an existing tractor
 * @param id Tractor ID to update
 * @param tractorData Updated tractor data
 * @returns Updated tractor or null if not found
 */
export const updateTractor = (id: string, tractorData: Partial<Omit<Tractor, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>): Tractor | null => {
  const tractores = getAllTractores();
  const index = tractores.findIndex(tractor => tractor.id === id);
  
  if (index === -1) return null;
  
  // Update the tractor
  const updatedTractor: Tractor = {
    ...tractores[index],
    ...tractorData,
    fechaActualizacion: new Date().toISOString().split('T')[0]
  };
  
  tractores[index] = updatedTractor;
  localStorage.setItem(TRACTORES_STORAGE_KEY, JSON.stringify(tractores));
  
  return updatedTractor;
};

/**
 * Delete a tractor by ID
 * @param id Tractor ID to delete
 * @returns true if deleted, false if not found
 */
export const deleteTractor = (id: string): boolean => {
  const tractores = getAllTractores();
  const filteredTractores = tractores.filter(tractor => tractor.id !== id);
  
  if (filteredTractores.length === tractores.length) {
    return false; // Tractor not found
  }
  
  localStorage.setItem(TRACTORES_STORAGE_KEY, JSON.stringify(filteredTractores));
  return true;
};

/**
 * Toggle a tractor's availability status between 'Disponible' and 'En reparación'
 * @param id Tractor ID
 * @returns Updated tractor or null if not found
 */
export const toggleTractorStatus = (id: string): Tractor | null => {
  const tractor = getTractorById(id);
  if (!tractor) return null;
  
  const newEstado = tractor.estado === 'Disponible' ? 'En reparación' : 'Disponible';
  return updateTractor(id, { estado: newEstado });
};

/**
 * Search tractores by marca, modelo, or dominio (patente)
 * @param query Search query
 * @returns Array of matching tractores
 */
export const searchTractores = (query: string): Tractor[] => {
  if (!query.trim()) return getAllTractores();
  
  const tractores = getAllTractores();
  const lowerQuery = query.toLowerCase();
  
  return tractores.filter(tractor => 
    tractor.marca.toLowerCase().includes(lowerQuery) ||
    tractor.modelo.toLowerCase().includes(lowerQuery) ||
    tractor.dominio.toLowerCase().includes(lowerQuery) ||
    tractor.tipoServicio.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Reset to initial data (useful for testing or resetting the app)
 */
export const resetTractoresData = (): void => {
  localStorage.setItem(TRACTORES_STORAGE_KEY, JSON.stringify(initialTractores));
};
