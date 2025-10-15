import { create } from 'zustand';
import { 
  getParadasByViaje, 
  createParada, 
  finalizarViaje,
  exportarParadas,
} from '../services/paradasService';
import type { Parada, CreateParadaDTO } from '@/types/parada';

interface ParadasState {
  // Estado
  paradas: Parada[];
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchParadasByViaje: (viajeId: string) => Promise<void>;
  addParada: (parada: CreateParadaDTO) => Promise<void>;
  finalizarViaje: (viajeId: string) => Promise<void>;
  exportarParadas: (viajeId: string) => Promise<any>;
  clearParadas: () => void;
  clearError: () => void;
}

export const useParadasStore = create<ParadasState>((set) => ({
  // Estado inicial
  paradas: [],
  isLoading: false,
  error: null,
  
  // Acciones
  fetchParadasByViaje: async (viajeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getParadasByViaje(viajeId);
      set({ paradas: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar paradas', 
        isLoading: false 
      });
    }
  },
  
  addParada: async (parada: CreateParadaDTO) => {
    set({ isLoading: true, error: null });
    try {
      await createParada(parada);
      // Recargar paradas después de crear una nueva
      const data = await getParadasByViaje(String(parada.viaje_id));
      set({ paradas: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear parada', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  finalizarViaje: async (viajeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await finalizarViaje(viajeId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al finalizar viaje', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  exportarParadas: async (viajeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await exportarParadas(viajeId);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al exportar paradas', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  clearParadas: () => {
    set({ paradas: [] });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
