import { create } from 'zustand';
import { 
  getAllUsuarios, 
  getUsuarioById, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario, 
  searchUsuarios
} from '../services/usuariosService';
import { User, UserWithPassword } from '../types';

interface UsuariosState {
  // Estado
  usuarios: User[];
  selectedUsuario: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchUsuarios: () => Promise<void>;
  fetchUsuarioById: (id: string) => Promise<void>;
  addUsuario: (usuario: UserWithPassword) => Promise<void>;
  editUsuario: (id: string, usuario: Partial<Omit<User, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>) => Promise<void>;
  removeUsuario: (id: string) => Promise<void>;
  searchUsuario: (query: string) => Promise<void>;
  cambiarEstado: (id: string, estado: 'Activo' | 'Inactivo' | 'Suspendido') => Promise<void>;
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
  
  fetchUsuarioById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getUsuarioById(id);
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
      const updatedUsuario = await updateUsuario(id, usuario);
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
      const success = await deleteUsuario(id);
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
  
  cambiarEstado: async (id, estado) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUsuario = await updateUsuario(id, { estado });
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
        error: error instanceof Error ? error.message : 'Error al cambiar el estado del usuario', 
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
