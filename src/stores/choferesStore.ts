import { create } from 'zustand';
import { 
  getAllChoferes, 
  getChoferById, 
  createChofer, 
  updateChofer, 
  deleteChofer, 
  searchChoferes,
  getChoferesLicenciaProximaVencer,
  getChoferesLicenciaVencida,
  toggleChoferStatus
} from '../services/choferesService';
import type { Chofer } from '@/types/chofer';
import { 
  normalizeDni, 
  normalizeTelefono, 
  normalizeEmail, 
  normalizeTexto 
} from '@/utils/inputNormalizers';

interface ChoferesState {
  // Estado
  choferes: Chofer[];
  selectedChofer: Chofer | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchChoferes: () => Promise<void>;
  fetchChoferById: (id: number) => Promise<void>;
  addChofer: (chofer: Omit<Chofer, 'id' | 'usuario_id'>) => Promise<void>;
  editChofer: (id: number, chofer: Partial<Omit<Chofer, 'id' | 'usuario_id'>>) => Promise<void>;
  removeChofer: (id: number) => Promise<void>;
  searchChofer: (query: string) => Promise<void>;
  fetchLicenciasProximasVencer: (dias?: number) => Promise<void>;
  fetchLicenciasVencidas: () => Promise<void>;
  toggleActivo: (id: number) => Promise<void>;
  clearSelectedChofer: () => void;
  clearError: () => void;
}

export const useChoferesStore = create<ChoferesState>((set) => ({
  // Estado inicial
  choferes: [],
  selectedChofer: null,
  isLoading: false,
  error: null,
  
  // Acciones
  fetchChoferes: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllChoferes();
      set({ choferes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar choferes', 
        isLoading: false 
      });
    }
  },
  
  fetchChoferById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getChoferById(String(id));
      set({ selectedChofer: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar el chofer', 
        isLoading: false 
      });
    }
  },
  
  addChofer: async (chofer) => {
    set({ isLoading: true, error: null });
    try {
      const normalizedChofer = {
        ...chofer,
        nombre: normalizeTexto(chofer.nombre),
        apellido: normalizeTexto(chofer.apellido),
        dni: normalizeDni(chofer.dni),
        telefono: chofer.telefono ? normalizeTelefono(chofer.telefono) : '',
        email: chofer.email ? normalizeEmail(chofer.email) : '',
        licencia: chofer.licencia ? normalizeTexto(chofer.licencia) : ''
      };
      const newChofer = await createChofer(normalizedChofer);
      set(state => ({ 
        choferes: [...state.choferes, newChofer],
        selectedChofer: newChofer,
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el chofer';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error;
    }
  },
  
  editChofer: async (id, chofer) => {
    set({ isLoading: true, error: null });
    try {
      const normalizedChofer = {
        ...chofer,
        ...(chofer.nombre && { nombre: normalizeTexto(chofer.nombre) }),
        ...(chofer.apellido && { apellido: normalizeTexto(chofer.apellido) }),
        ...(chofer.dni && { dni: normalizeDni(chofer.dni) }),
        ...(chofer.telefono !== undefined && { telefono: chofer.telefono ? normalizeTelefono(chofer.telefono) : '' }),
        ...(chofer.email !== undefined && { email: chofer.email ? normalizeEmail(chofer.email) : '' }),
        ...(chofer.licencia && { licencia: normalizeTexto(chofer.licencia) })
      };
      const updatedChofer = await updateChofer(String(id), normalizedChofer);
      if (updatedChofer) {
        set(state => ({ 
          choferes: state.choferes.map(item => 
            item.id === id ? updatedChofer : item
          ),
          selectedChofer: updatedChofer,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el chofer');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el chofer';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error;
    }
  },
  
  removeChofer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteChofer(String(id));
      if (success) {
        set(state => ({ 
          choferes: state.choferes.filter(item => item.id !== id),
          selectedChofer: state.selectedChofer?.id === id ? null : state.selectedChofer,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el chofer');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el chofer';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error;
    }
  },
  
  searchChofer: async (query) => {
    set({ isLoading: true, error: null });
    try {
      if (!query.trim()) {
        const data = await getAllChoferes();
        set({ choferes: data, isLoading: false });
      } else {
        const data = await searchChoferes(query);
        set({ choferes: data, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al buscar choferes', 
        isLoading: false 
      });
    }
  },
  
  fetchLicenciasProximasVencer: async (dias = 30) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getChoferesLicenciaProximaVencer(dias);
      set({ choferes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar choferes con licencias próximas a vencer', 
        isLoading: false 
      });
    }
  },
  
  fetchLicenciasVencidas: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getChoferesLicenciaVencida();
      set({ choferes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar choferes con licencias vencidas', 
        isLoading: false 
      });
    }
  },
  
  toggleActivo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updatedChofer = await toggleChoferStatus(String(id));
      if (updatedChofer) {
        set(state => ({ 
          choferes: state.choferes.map(item => 
            item.id === id ? updatedChofer : item
          ),
          selectedChofer: state.selectedChofer?.id === id ? updatedChofer : state.selectedChofer,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el chofer');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cambiar el estado del chofer', 
        isLoading: false 
      });
    }
  },
  
  clearSelectedChofer: () => {
    set({ selectedChofer: null });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
