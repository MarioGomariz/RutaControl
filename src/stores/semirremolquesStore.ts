import { create } from 'zustand';
import { 
  getAllSemirremolques, 
  getSemirremolqueById, 
  createSemirremolque, 
  updateSemirremolque, 
  deleteSemirremolque, 
  searchSemirremolques,
  getSemirremolquesVencimientoProximo,
  getSemirremolquesVencimientoExpirado
} from '../services/semirremolquesService';
import type { Semirremolque } from '@/types/semirremolque';
import { normalizeMatricula, normalizeTexto } from '@/utils/inputNormalizers';

interface SemirremolquesState {
  // Estado
  semirremolques: Semirremolque[];
  selectedSemirremolque: Semirremolque | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchSemirremolques: () => Promise<void>;
  fetchSemirremolqueById: (id: number) => Promise<void>;
  addSemirremolque: (semirremolque: Omit<Semirremolque, 'id'>) => Promise<void>;
  editSemirremolque: (id: number, semirremolque: Partial<Omit<Semirremolque, 'id'>>) => Promise<void>;
  removeSemirremolque: (id: number) => Promise<void>;
  searchSemirremolque: (query: string) => Promise<void>;
  fetchVencimientosProximos: (campo: 'vencimiento_rto' | 'vencimiento_visual_ext' | 'vencimiento_visual_int' | 'vencimiento_espesores' | 'vencimiento_prueba_hidraulica' | 'vencimiento_mangueras' | 'vencimiento_valvula_five', dias?: number) => Promise<void>;
  fetchVencimientosExpirados: (campo: 'vencimiento_rto' | 'vencimiento_visual_ext' | 'vencimiento_visual_int' | 'vencimiento_espesores' | 'vencimiento_prueba_hidraulica' | 'vencimiento_mangueras' | 'vencimiento_valvula_five') => Promise<void>;
  clearSelectedSemirremolque: () => void;
  clearError: () => void;
}

export const useSemirremolquesStore = create<SemirremolquesState>((set) => ({
  // Estado inicial
  semirremolques: [],
  selectedSemirremolque: null,
  isLoading: false,
  error: null,
  
  // Acciones
  fetchSemirremolques: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllSemirremolques();
      set({ semirremolques: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar semirremolques', 
        isLoading: false 
      });
    }
  },
  
  fetchSemirremolqueById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSemirremolqueById(String(id));
      set({ selectedSemirremolque: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar el semirremolque', 
        isLoading: false 
      });
    }
  },
  
  addSemirremolque: async (semirremolque) => {
    set({ isLoading: true, error: null });
    try {
      const normalizedSemirremolque = {
        ...semirremolque,
        nombre: semirremolque.nombre ? normalizeTexto(semirremolque.nombre) : '',
        dominio: semirremolque.dominio ? normalizeMatricula(semirremolque.dominio) : '',
        tipo_servicio: semirremolque.tipo_servicio ? normalizeTexto(semirremolque.tipo_servicio) : ''
      };
      const newSemirremolque = await createSemirremolque(normalizedSemirremolque);
      set(state => ({ 
        semirremolques: [...state.semirremolques, newSemirremolque],
        selectedSemirremolque: newSemirremolque,
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el semirremolque';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  editSemirremolque: async (id, semirremolque) => {
    set({ isLoading: true, error: null });
    try {
      const normalizedSemirremolque = {
        ...semirremolque,
        ...(semirremolque.nombre && { nombre: normalizeTexto(semirremolque.nombre) }),
        ...(semirremolque.dominio && { dominio: normalizeMatricula(semirremolque.dominio) }),
        ...(semirremolque.tipo_servicio && { tipo_servicio: normalizeTexto(semirremolque.tipo_servicio) })
      };
      const updatedSemirremolque = await updateSemirremolque(String(id), normalizedSemirremolque);
      if (updatedSemirremolque) {
        set(state => ({ 
          semirremolques: state.semirremolques.map(item => 
            item.id === id ? updatedSemirremolque : item
          ),
          selectedSemirremolque: updatedSemirremolque,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el semirremolque');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el semirremolque';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  removeSemirremolque: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteSemirremolque(String(id));
      if (success) {
        set(state => ({ 
          semirremolques: state.semirremolques.filter(item => item.id !== id),
          selectedSemirremolque: state.selectedSemirremolque?.id === id ? null : state.selectedSemirremolque,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el semirremolque');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el semirremolque';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error;
    }
  },
  
  searchSemirremolque: async (query) => {
    set({ isLoading: true, error: null });
    try {
      if (!query.trim()) {
        const data = await getAllSemirremolques();
        set({ semirremolques: data, isLoading: false });
      } else {
        const data = await searchSemirremolques(query);
        set({ semirremolques: data, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al buscar semirremolques', 
        isLoading: false 
      });
    }
  },
  
  fetchVencimientosProximos: async (campo, dias = 30) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSemirremolquesVencimientoProximo(campo, dias);
      set({ semirremolques: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar vencimientos próximos', 
        isLoading: false 
      });
    }
  },
  
  fetchVencimientosExpirados: async (campo) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSemirremolquesVencimientoExpirado(campo);
      set({ semirremolques: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar vencimientos expirados', 
        isLoading: false 
      });
    }
  },
  
  clearSelectedSemirremolque: () => {
    set({ selectedSemirremolque: null });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
