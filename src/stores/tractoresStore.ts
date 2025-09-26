import { create } from 'zustand';
import { 
  getAllTractores, 
  getTractorById, 
  createTractor, 
  updateTractor, 
  deleteTractor, 
  searchTractores,
  getTractoresRTOProximo,
  getTractoresRTOExpirado,
  getTractoresPorEstado,
  getTractoresPorTipoServicio
} from '../services/tractoresService';
import type { Tractor } from '@/types/tractor';

interface TractoresState {
  // Estado
  tractores: Tractor[];
  selectedTractor: Tractor | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchTractores: () => Promise<void>;
  fetchTractorById: (id: number) => Promise<void>;
  addTractor: (tractor: Omit<Tractor, 'id'>) => Promise<void>;
  editTractor: (id: number, tractor: Partial<Omit<Tractor, 'id'>>) => Promise<void>;
  removeTractor: (id: number) => Promise<void>;
  searchTractor: (query: string) => Promise<void>;
  fetchRTOProximos: (dias?: number) => Promise<void>;
  fetchRTOExpirados: () => Promise<void>;
  fetchPorEstado: (estado: string) => Promise<void>;
  fetchPorTipoServicio: (tipoServicio: string) => Promise<void>;
  clearSelectedTractor: () => void;
  clearError: () => void;
}

export const useTractoresStore = create<TractoresState>((set) => ({
  // Estado inicial
  tractores: [],
  selectedTractor: null,
  isLoading: false,
  error: null,
  
  // Acciones
  fetchTractores: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllTractores();
      set({ tractores: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar tractores', 
        isLoading: false 
      });
    }
  },
  
  fetchTractorById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getTractorById(String(id));
      set({ selectedTractor: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar el tractor', 
        isLoading: false 
      });
    }
  },
  
  addTractor: async (tractor) => {
    set({ isLoading: true, error: null });
    try {
      const newTractor = await createTractor(tractor);
      set(state => ({ 
        tractores: [...state.tractores, newTractor],
        selectedTractor: newTractor,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear el tractor', 
        isLoading: false 
      });
    }
  },
  
  editTractor: async (id, tractor) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTractor = await updateTractor(String(id), tractor);
      if (updatedTractor) {
        set(state => ({ 
          tractores: state.tractores.map(item => 
            item.id === id ? updatedTractor : item
          ),
          selectedTractor: updatedTractor,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el tractor');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar el tractor', 
        isLoading: false 
      });
    }
  },
  
  removeTractor: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteTractor(String(id));
      if (success) {
        set(state => ({ 
          tractores: state.tractores.filter(item => item.id !== id),
          selectedTractor: state.selectedTractor?.id === id ? null : state.selectedTractor,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el tractor');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar el tractor', 
        isLoading: false 
      });
    }
  },
  
  searchTractor: async (query) => {
    set({ isLoading: true, error: null });
    try {
      if (!query.trim()) {
        const data = await getAllTractores();
        set({ tractores: data, isLoading: false });
      } else {
        const data = await searchTractores(query);
        set({ tractores: data, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al buscar tractores', 
        isLoading: false 
      });
    }
  },
  
  fetchRTOProximos: async (dias = 30) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getTractoresRTOProximo(dias);
      set({ tractores: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar tractores con RTO próximo a vencer', 
        isLoading: false 
      });
    }
  },
  
  fetchRTOExpirados: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getTractoresRTOExpirado();
      set({ tractores: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar tractores con RTO vencido', 
        isLoading: false 
      });
    }
  },
  
  fetchPorEstado: async (estado) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getTractoresPorEstado(estado);
      set({ tractores: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Error al cargar tractores con estado ${estado}`, 
        isLoading: false 
      });
    }
  },
  
  fetchPorTipoServicio: async (tipoServicio) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getTractoresPorTipoServicio(tipoServicio);
      set({ tractores: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Error al cargar tractores con tipo de servicio ${tipoServicio}`, 
        isLoading: false 
      });
    }
  },
  
  clearSelectedTractor: () => {
    set({ selectedTractor: null });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
