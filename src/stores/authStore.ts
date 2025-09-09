import { create } from 'zustand';
import { User } from '../utils/auth';

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
};

// Creamos el store
export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false })
}));

// Exportamos una referencia directa al store para uso en funciones no-React
export const authStore = useAuth;
