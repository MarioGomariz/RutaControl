import { create } from 'zustand';
import { getAllServicios } from '../services/serviciosService';
import type { Servicio } from '@/types/servicio';

/**
 * Store simplificado para servicios
 * Solo hay 2 servicios fijos: Gas Líquido y Combustible Líquido
 * No se permite crear, actualizar o eliminar servicios
 */
interface ServiciosState {
  // Estado
  servicios: Servicio[];
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchServicios: () => Promise<void>;
  clearError: () => void;
}

export const useServiciosStore = create<ServiciosState>((set) => ({
  // Estado inicial
  servicios: [],
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
  
  clearError: () => {
    set({ error: null });
  }
}));
