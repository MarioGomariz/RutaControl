import { create } from 'zustand';
import type { FiltrosEstadisticas, RespuestaEstadisticas } from '@/types/estadisticas';
import { obtenerEstadisticas as obtenerEstadisticasService } from '@/services/estadisticasService';

interface EstadisticasState {
  estadisticas: RespuestaEstadisticas | null;
  isLoading: boolean;
  error: string | null;
  filtros: FiltrosEstadisticas;
  
  fetchEstadisticas: (filtros?: FiltrosEstadisticas) => Promise<void>;
  setFiltros: (filtros: FiltrosEstadisticas) => void;
  clearError: () => void;
}

export const useEstadisticasStore = create<EstadisticasState>((set, get) => ({
  estadisticas: null,
  isLoading: false,
  error: null,
  filtros: {},
  
  fetchEstadisticas: async (filtros?: FiltrosEstadisticas) => {
    set({ isLoading: true, error: null });
    try {
      const filtrosActuales = filtros || get().filtros;
      const data = await obtenerEstadisticasService(filtrosActuales);
      set({ estadisticas: data, isLoading: false, filtros: filtrosActuales });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Error al cargar estadísticas',
        isLoading: false 
      });
    }
  },
  
  setFiltros: (filtros: FiltrosEstadisticas) => {
    set({ filtros });
  },
  
  clearError: () => set({ error: null }),
}));
