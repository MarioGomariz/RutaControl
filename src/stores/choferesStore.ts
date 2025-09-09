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
import { Chofer } from '../types';

interface ChoferesState {
  // Estado
  choferes: Chofer[];
  selectedChofer: Chofer | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchChoferes: () => Promise<void>;
  fetchChoferById: (id: string) => Promise<void>;
  addChofer: (chofer: Omit<Chofer, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>) => Promise<void>;
  editChofer: (id: string, chofer: Partial<Omit<Chofer, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>) => Promise<void>;
  removeChofer: (id: string) => Promise<void>;
  searchChofer: (query: string) => Promise<void>;
  fetchLicenciasProximasVencer: (dias?: number) => Promise<void>;
  fetchLicenciasVencidas: () => Promise<void>;
  toggleActivo: (id: string) => Promise<void>;
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
  
  fetchChoferById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getChoferById(id);
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
      const newChofer = await createChofer(chofer);
      set(state => ({ 
        choferes: [...state.choferes, newChofer],
        selectedChofer: newChofer,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear el chofer', 
        isLoading: false 
      });
    }
  },
  
  editChofer: async (id, chofer) => {
    set({ isLoading: true, error: null });
    try {
      const updatedChofer = await updateChofer(id, chofer);
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
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar el chofer', 
        isLoading: false 
      });
    }
  },
  
  removeChofer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteChofer(id);
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
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar el chofer', 
        isLoading: false 
      });
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
      const updatedChofer = await toggleChoferStatus(id);
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
