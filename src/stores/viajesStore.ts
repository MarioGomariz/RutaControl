import { create } from 'zustand';
import { 
  getAllViajes, 
  getViajeById, 
  createViaje, 
  updateViaje, 
  deleteViaje, 
  searchViajes,
  getViajesByChofer,
  getViajesByTractor,
  getViajesBySemirremolque,
  getViajesByEstado,
  getViajesByFechas,
  cambiarEstadoViaje,
  Viaje
} from '../services/viajesService';
import type { EstadoViaje } from '../types';

interface ViajesState {
  // Estado
  viajes: Viaje[];
  selectedViaje: Viaje | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchViajes: () => Promise<void>;
  fetchViajeById: (id: string) => Promise<void>;
  addViaje: (viaje: Omit<Viaje, 'id'>) => Promise<void>;
  editViaje: (id: string, viaje: Partial<Omit<Viaje, 'id'>>) => Promise<void>;
  removeViaje: (id: string) => Promise<void>;
  searchViaje: (query: string) => Promise<void>;
  fetchViajesByChofer: (choferId: string) => Promise<void>;
  fetchViajesByTractor: (tractorId: string) => Promise<void>;
  fetchViajesBySemirremolque: (semirremolqueId: string) => Promise<void>;
  fetchViajesByEstado: (estado: EstadoViaje) => Promise<void>;
  fetchViajesByFechas: (fechaInicio: string, fechaFin: string) => Promise<void>;
  cambiarEstado: (id: string, estado: EstadoViaje) => Promise<void>;
  clearSelectedViaje: () => void;
  clearError: () => void;
}

export const useViajesStore = create<ViajesState>((set) => ({
  // Estado inicial
  viajes: [],
  selectedViaje: null,
  isLoading: false,
  error: null,
  
  // Acciones
  fetchViajes: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllViajes();
      set({ viajes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar viajes', 
        isLoading: false 
      });
    }
  },
  
  fetchViajeById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getViajeById(id);
      set({ selectedViaje: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar el viaje', 
        isLoading: false 
      });
    }
  },
  
  addViaje: async (viaje) => {
    set({ isLoading: true, error: null });
    try {
      const newViaje = await createViaje(viaje);
      set(state => ({ 
        viajes: [...state.viajes, newViaje],
        selectedViaje: newViaje,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear el viaje', 
        isLoading: false 
      });
    }
  },
  
  editViaje: async (id, viaje) => {
    set({ isLoading: true, error: null });
    try {
      const updatedViaje = await updateViaje(id, viaje);
      if (updatedViaje) {
        set(state => ({ 
          viajes: state.viajes.map(item => 
            item.id === Number(id) ? updatedViaje : item
          ),
          selectedViaje: updatedViaje,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el viaje');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar el viaje', 
        isLoading: false 
      });
    }
  },
  
  removeViaje: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteViaje(id);
      if (success) {
        set(state => ({ 
          viajes: state.viajes.filter(item => item.id !== Number(id)),
          selectedViaje: state.selectedViaje?.id === Number(id) ? null : state.selectedViaje,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el viaje');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar el viaje', 
        isLoading: false 
      });
    }
  },
  
  searchViaje: async (query) => {
    set({ isLoading: true, error: null });
    try {
      if (!query.trim()) {
        const data = await getAllViajes();
        set({ viajes: data, isLoading: false });
      } else {
        const data = await searchViajes(query);
        set({ viajes: data, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al buscar viajes', 
        isLoading: false 
      });
    }
  },
  
  fetchViajesByChofer: async (choferId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getViajesByChofer(choferId);
      set({ viajes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar viajes por chofer', 
        isLoading: false 
      });
    }
  },
  
  fetchViajesByTractor: async (tractorId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getViajesByTractor(tractorId);
      set({ viajes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar viajes por tractor', 
        isLoading: false 
      });
    }
  },
  
  fetchViajesBySemirremolque: async (semirremolqueId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getViajesBySemirremolque(semirremolqueId);
      set({ viajes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar viajes por semirremolque', 
        isLoading: false 
      });
    }
  },
  
  fetchViajesByEstado: async (estado) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getViajesByEstado(estado);
      set({ viajes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar viajes por estado', 
        isLoading: false 
      });
    }
  },
  
  fetchViajesByFechas: async (fechaInicio, fechaFin) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getViajesByFechas(fechaInicio, fechaFin);
      set({ viajes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar viajes por rango de fechas', 
        isLoading: false 
      });
    }
  },
  
  cambiarEstado: async (id, estado) => {
    set({ isLoading: true, error: null });
    try {
      const updatedViaje = await cambiarEstadoViaje(id, estado);
      if (updatedViaje) {
        set(state => ({ 
          viajes: state.viajes.map(item => 
            item.id === Number(id) ? updatedViaje : item
          ),
          selectedViaje: state.selectedViaje?.id === Number(id) ? updatedViaje : state.selectedViaje,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el viaje');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cambiar el estado del viaje', 
        isLoading: false 
      });
    }
  },
  
  clearSelectedViaje: () => {
    set({ selectedViaje: null });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
