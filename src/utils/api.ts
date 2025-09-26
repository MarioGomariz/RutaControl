import axios from "axios";
import { authStore } from '@/stores/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getToken() {
  return localStorage.getItem("authToken"); // Cambiado a localStorage para persistencia
}

// Agrega Authorization a cada request si hay token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Error en interceptor de request:', error);
  return Promise.reject(error);
});

// Maneja 401 globalmente
api.interceptors.response.use(
  (r) => r,
  (error) => {
    console.error('Error en respuesta API:', error?.response?.status, error?.message);
    
    if (error?.response?.status === 401) {
      console.log('Error 401 detectado, limpiando sesión');
      // Limpiar token y usuario
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      // Actualizar el store de autenticación
      authStore.setState({ user: null, isAuthenticated: false });
      
      // Redirigir al login si no estamos ya allí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
