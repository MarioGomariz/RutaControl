import { create } from 'zustand';
import { 
  getAllServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
  searchServicios,
  getServiciosPorRangoFechas,
  getServiciosPorEstado,
  getServiciosPorChofer,
  getServiciosPorTractor,
  getServiciosPorSemirremolque,
  updateEstadoServicio,
  completarServicio,
  cancelarServicio
} from '../services/serviciosService';
import { Servicio } from '../utils/supabase';

interface ServiciosState {
  // Estado
  servicios: Servicio[];
  selectedServicio: Servicio | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchServicios: () => Promise<void>;
  fetchServicioById: (id: string) => Promise<void>;
  addServicio: (servicio: Omit<Servicio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>) => Promise<void>;
  editServicio: (id: string, servicio: Partial<Omit<Servicio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>) => Promise<void>;
  removeServicio: (id: string) => Promise<void>;
  searchServicio: (query: string) => Promise<void>;
  fetchPorRangoFechas: (fechaInicio: Date, fechaFin: Date) => Promise<void>;
  fetchPorEstado: (estado: 'pendiente' | 'en_curso' | 'completado' | 'cancelado') => Promise<void>;
  fetchPorChofer: (choferId: string) => Promise<void>;
  fetchPorTractor: (tractorId: string) => Promise<void>;
  fetchPorSemirremolque: (semirremolqueId: string) => Promise<void>;
  cambiarEstado: (id: string, estado: 'pendiente' | 'en_curso' | 'completado' | 'cancelado') => Promise<void>;
  completar: (id: string, fechaFin: Date, observaciones?: string) => Promise<void>;
  cancelar: (id: string, motivo: string) => Promise<void>;
  clearSelectedServicio: () => void;
  clearError: () => void;
}

export const useServiciosStore = create<ServiciosState>((set) => ({
  // Estado inicial
  servicios: [],
  selectedServicio: null,
  isLoading: false,
  error: null,
  
  // Acciones
  fetchServicios: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllServicios();
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios', 
        isLoading: false 
      });
    }
  },
  
  fetchServicioById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServicioById(id);
      set({ selectedServicio: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar el servicio', 
        isLoading: false 
      });
    }
  },
  
  addServicio: async (servicio) => {
    set({ isLoading: true, error: null });
    try {
      const newServicio = await createServicio(servicio);
      set(state => ({ 
        servicios: [...state.servicios, newServicio],
        selectedServicio: newServicio,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear el servicio', 
        isLoading: false 
      });
    }
  },
  
  editServicio: async (id, servicio) => {
    set({ isLoading: true, error: null });
    try {
      const updatedServicio = await updateServicio(id, servicio);
      if (updatedServicio) {
        set(state => ({ 
          servicios: state.servicios.map(item => 
            item.id === id ? updatedServicio : item
          ),
          selectedServicio: updatedServicio,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el servicio');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar el servicio', 
        isLoading: false 
      });
    }
  },
  
  removeServicio: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteServicio(id);
      if (success) {
        set(state => ({ 
          servicios: state.servicios.filter(item => item.id !== id),
          selectedServicio: state.selectedServicio?.id === id ? null : state.selectedServicio,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el servicio');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar el servicio', 
        isLoading: false 
      });
    }
  },
  
  searchServicio: async (query) => {
    set({ isLoading: true, error: null });
    try {
      if (!query.trim()) {
        const data = await getAllServicios();
        set({ servicios: data, isLoading: false });
      } else {
        const data = await searchServicios(query);
        set({ servicios: data, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al buscar servicios', 
        isLoading: false 
      });
    }
  },
  
  fetchPorRangoFechas: async (fechaInicio, fechaFin) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorRangoFechas(fechaInicio, fechaFin);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios por rango de fechas', 
        isLoading: false 
      });
    }
  },
  
  fetchPorEstado: async (estado) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorEstado(estado);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Error al cargar servicios con estado ${estado}`, 
        isLoading: false 
      });
    }
  },
  
  fetchPorChofer: async (choferId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorChofer(choferId);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios por chofer', 
        isLoading: false 
      });
    }
  },
  
  fetchPorTractor: async (tractorId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorTractor(tractorId);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios por tractor', 
        isLoading: false 
      });
    }
  },
  
  fetchPorSemirremolque: async (semirremolqueId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorSemirremolque(semirremolqueId);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios por semirremolque', 
        isLoading: false 
      });
    }
  },
  
  cambiarEstado: async (id, estado) => {
    set({ isLoading: true, error: null });
    try {
      const updatedServicio = await updateEstadoServicio(id, estado);
      if (updatedServicio) {
        set(state => ({ 
          servicios: state.servicios.map(item => 
            item.id === id ? updatedServicio : item
          ),
          selectedServicio: state.selectedServicio?.id === id ? updatedServicio : state.selectedServicio,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el servicio');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cambiar el estado del servicio', 
        isLoading: false 
      });
    }
  },
  
  completar: async (id, fechaFin, observaciones) => {
    set({ isLoading: true, error: null });
    try {
      const updatedServicio = await completarServicio(id, fechaFin, observaciones);
      if (updatedServicio) {
        set(state => ({ 
          servicios: state.servicios.map(item => 
            item.id === id ? updatedServicio : item
          ),
          selectedServicio: state.selectedServicio?.id === id ? updatedServicio : state.selectedServicio,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el servicio');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al completar el servicio', 
        isLoading: false 
      });
    }
  },
  
  cancelar: async (id, motivo) => {
    set({ isLoading: true, error: null });
    try {
      const updatedServicio = await cancelarServicio(id, motivo);
      if (updatedServicio) {
        set(state => ({ 
          servicios: state.servicios.map(item => 
            item.id === id ? updatedServicio : item
          ),
          selectedServicio: state.selectedServicio?.id === id ? updatedServicio : state.selectedServicio,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el servicio');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cancelar el servicio', 
        isLoading: false 
      });
    }
  },
  
  clearSelectedServicio: () => {
    set({ selectedServicio: null });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
