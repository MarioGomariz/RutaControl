// Define the Chofer type
export interface Chofer {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string;
  licencia: string;
  fechaVencimientoLicencia: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Mock data for initial choferes
const initialChoferes: Chofer[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '25678901',
    telefono: '1123456789',
    email: 'juan.perez@example.com',
    licencia: 'A12345',
    fechaVencimientoLicencia: '2026-05-15',
    activo: true,
    fechaCreacion: '2024-01-10',
    fechaActualizacion: '2024-01-10'
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'González',
    dni: '30987654',
    telefono: '1187654321',
    licencia: 'B67890',
    fechaVencimientoLicencia: '2025-08-22',
    activo: true,
    fechaCreacion: '2024-02-05',
    fechaActualizacion: '2024-02-05'
  },
  {
    id: '3',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    dni: '28456123',
    telefono: '1156781234',
    email: 'carlos.rodriguez@example.com',
    licencia: 'C54321',
    fechaVencimientoLicencia: '2027-03-10',
    activo: false,
    fechaCreacion: '2023-11-20',
    fechaActualizacion: '2024-03-15'
  }
];

// Storage key for localStorage
const CHOFERES_STORAGE_KEY = 'choferes_data';

/**
 * Initialize the choferes data in localStorage if it doesn't exist
 */
const initializeChoferes = (): void => {
  if (!localStorage.getItem(CHOFERES_STORAGE_KEY)) {
    localStorage.setItem(CHOFERES_STORAGE_KEY, JSON.stringify(initialChoferes));
  }
};

/**
 * Get all choferes
 * @returns Array of all choferes
 */
export const getAllChoferes = (): Chofer[] => {
  initializeChoferes();
  const data = localStorage.getItem(CHOFERES_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Get a chofer by ID
 * @param id Chofer ID
 * @returns Chofer object or null if not found
 */
export const getChoferById = (id: string): Chofer | null => {
  const choferes = getAllChoferes();
  return choferes.find(chofer => chofer.id === id) || null;
};

/**
 * Create a new chofer
 * @param chofer Chofer data (without ID)
 * @returns The created chofer with ID
 */
export const createChofer = (chofer: Omit<Chofer, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Chofer => {
  const choferes = getAllChoferes();
  
  // Generate a new ID (in a real app, this would be handled by the backend)
  const newId = (Math.max(...choferes.map(c => parseInt(c.id)), 0) + 1).toString();
  
  const now = new Date().toISOString().split('T')[0];
  
  const newChofer: Chofer = {
    ...chofer,
    id: newId,
    fechaCreacion: now,
    fechaActualizacion: now
  };
  
  // Add to the list and save
  const updatedChoferes = [...choferes, newChofer];
  localStorage.setItem(CHOFERES_STORAGE_KEY, JSON.stringify(updatedChoferes));
  
  return newChofer;
};

/**
 * Update an existing chofer
 * @param id Chofer ID to update
 * @param choferData Updated chofer data
 * @returns Updated chofer or null if not found
 */
export const updateChofer = (id: string, choferData: Partial<Omit<Chofer, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>): Chofer | null => {
  const choferes = getAllChoferes();
  const index = choferes.findIndex(chofer => chofer.id === id);
  
  if (index === -1) return null;
  
  // Update the chofer
  const updatedChofer: Chofer = {
    ...choferes[index],
    ...choferData,
    fechaActualizacion: new Date().toISOString().split('T')[0]
  };
  
  choferes[index] = updatedChofer;
  localStorage.setItem(CHOFERES_STORAGE_KEY, JSON.stringify(choferes));
  
  return updatedChofer;
};

/**
 * Delete a chofer by ID
 * @param id Chofer ID to delete
 * @returns true if deleted, false if not found
 */
export const deleteChofer = (id: string): boolean => {
  const choferes = getAllChoferes();
  const filteredChoferes = choferes.filter(chofer => chofer.id !== id);
  
  if (filteredChoferes.length === choferes.length) {
    return false; // Chofer not found
  }
  
  localStorage.setItem(CHOFERES_STORAGE_KEY, JSON.stringify(filteredChoferes));
  return true;
};

/**
 * Toggle a chofer's active status
 * @param id Chofer ID
 * @returns Updated chofer or null if not found
 */
export const toggleChoferStatus = (id: string): Chofer | null => {
  const chofer = getChoferById(id);
  if (!chofer) return null;
  
  return updateChofer(id, { activo: !chofer.activo });
};

/**
 * Search choferes by name, last name, or DNI
 * @param query Search query
 * @returns Array of matching choferes
 */
export const searchChoferes = (query: string): Chofer[] => {
  if (!query.trim()) return getAllChoferes();
  
  const choferes = getAllChoferes();
  const lowerQuery = query.toLowerCase();
  
  return choferes.filter(chofer => 
    chofer.nombre.toLowerCase().includes(lowerQuery) ||
    chofer.apellido.toLowerCase().includes(lowerQuery) ||
    chofer.dni.includes(query)
  );
};

// Export a function to reset to initial data (useful for testing or resetting the app)
export const resetChoferesData = (): void => {
  localStorage.setItem(CHOFERES_STORAGE_KEY, JSON.stringify(initialChoferes));
};
