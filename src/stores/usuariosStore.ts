import { create } from 'zustand';
import {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  searchUsuarios
} from '../services/usuariosService';
import { Usuario } from '@/types/usuario';

interface UsuariosState {
  // Estado
  usuarios: Usuario[];
  selectedUsuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchUsuarios: () => Promise<void>;
  fetchUsuarioById: (id: number) => Promise<void>;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => Promise<void>;
  editUsuario: (id: number, usuario: Partial<Omit<Usuario, 'id'>>) => Promise<void>;
  removeUsuario: (id: number) => Promise<void>;
  searchUsuario: (query: string) => Promise<void>;
  cambiarEstado: (id: number, activo: boolean) => Promise<void>;
  clearSelectedUsuario: () => void;
  clearError: () => void;
}

export const useUsuariosStore = create<UsuariosState>((set) => ({
  // Estado inicial
  usuarios: [],
  selectedUsuario: null,
  isLoading: false,
  error: null,
  
  // Acciones
  fetchUsuarios: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllUsuarios();
      set({ usuarios: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar usuarios', 
        isLoading: false 
      });
    }
  },
  
  fetchUsuarioById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getUsuarioById(String(id));
      set({ selectedUsuario: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar el usuario', 
        isLoading: false 
      });
    }
  },
  
  addUsuario: async (usuario) => {
    set({ isLoading: true, error: null });
    try {
      const newUsuario = await createUsuario(usuario);
      set(state => ({ 
        usuarios: [...state.usuarios, newUsuario],
        selectedUsuario: newUsuario,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear el usuario', 
        isLoading: false 
      });
    }
  },
  
  editUsuario: async (id, usuario) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUsuario = await updateUsuario(String(id), usuario);
      if (updatedUsuario) {
        set(state => ({ 
          usuarios: state.usuarios.map(item => 
            item.id === id ? updatedUsuario : item
          ),
          selectedUsuario: updatedUsuario,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el usuario');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar el usuario', 
        isLoading: false 
      });
    }
  },
  
  removeUsuario: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteUsuario(String(id));
      if (success) {
        set(state => ({ 
          usuarios: state.usuarios.filter(item => item.id !== id),
          selectedUsuario: state.selectedUsuario?.id === id ? null : state.selectedUsuario,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el usuario');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar el usuario', 
        isLoading: false 
      });
    }
  },
  
  searchUsuario: async (query) => {
    set({ isLoading: true, error: null });
    try {
      if (!query.trim()) {
        const data = await getAllUsuarios();
        set({ usuarios: data, isLoading: false });
      } else {
        const data = await searchUsuarios(query);
        set({ usuarios: data, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al buscar usuarios', 
        isLoading: false 
      });
    }
  },
  
  cambiarEstado: async (id, activo) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUsuario = await updateUsuario(String(id), { activo });
      if (updatedUsuario) {
        set(state => ({ 
          usuarios: state.usuarios.map(item => 
            item.id === id ? updatedUsuario : item
          ),
          selectedUsuario: state.selectedUsuario?.id === id ? updatedUsuario : state.selectedUsuario,
          isLoading: false 
        }));
      } else {
        throw new Error('No se encontró el usuario');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cambiar activo del usuario', 
        isLoading: false 
      });
    }
  },
  
  clearSelectedUsuario: () => {
    set({ selectedUsuario: null });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
