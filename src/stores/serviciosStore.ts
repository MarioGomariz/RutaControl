import { create } from 'zustand';
import { 
  getAllServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
  searchServicios,
  getServiciosPorFechaCreacion,
  getServiciosPorTipo,
  getServiciosPorRequerimiento,
  getServiciosPorVisual,
  getServiciosPorValvula,
  updateObservacionesServicio,
  actualizarServicio,
  agregarObservacionServicio
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
  fetchPorFechaCreacion: (fechaInicio: Date, fechaFin: Date) => Promise<void>;
  fetchPorTipo: (tipo: string) => Promise<void>;
  fetchPorRequerimiento: (requiere: boolean) => Promise<void>;
  fetchPorVisual: (requiere: boolean) => Promise<void>;
  fetchPorValvula: (requiere: boolean) => Promise<void>;
  updateObservaciones: (id: string, observaciones: string) => Promise<void>;
  actualizarServicio: (id: string, descripcion: string, observaciones?: string) => Promise<void>;
  agregarObservacion: (id: string, observacion: string) => Promise<void>;
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
  
  fetchPorFechaCreacion: async (fechaInicio, fechaFin) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorFechaCreacion(fechaInicio, fechaFin);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios por rango de fechas', 
        isLoading: false 
      });
    }
  },
  
  fetchPorTipo: async (tipo) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorTipo(tipo);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Error al cargar servicios de tipo ${tipo}`, 
        isLoading: false 
      });
    }
  },
  
  fetchPorRequerimiento: async (requiere) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorRequerimiento(requiere);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios por requerimiento de prueba hidráulica', 
        isLoading: false 
      });
    }
  },
  
  fetchPorVisual: async (requiere) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorVisual(requiere);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios por requerimiento de visuales', 
        isLoading: false 
      });
    }
  },
  
  fetchPorValvula: async (requiere) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getServiciosPorValvula(requiere);
      set({ servicios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar servicios por requerimiento de válvulas y mangueras', 
        isLoading: false 
      });
    }
  },
  
  updateObservaciones: async (id, observaciones) => {
    set({ isLoading: true, error: null });
    try {
      const updatedServicio = await updateObservacionesServicio(id, observaciones);
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
        error: error instanceof Error ? error.message : 'Error al actualizar las observaciones del servicio', 
        isLoading: false 
      });
    }
  },
  
  actualizarServicio: async (id, descripcion, observaciones) => {
    set({ isLoading: true, error: null });
    try {
      const updatedServicio = await actualizarServicio(id, descripcion, observaciones);
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
        error: error instanceof Error ? error.message : 'Error al actualizar el servicio', 
        isLoading: false 
      });
    }
  },
  
  agregarObservacion: async (id, observacion) => {
    set({ isLoading: true, error: null });
    try {
      const updatedServicio = await agregarObservacionServicio(id, observacion);
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
        error: error instanceof Error ? error.message : 'Error al agregar observación al servicio', 
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
