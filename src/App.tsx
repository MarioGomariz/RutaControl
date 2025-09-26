import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/utils/auth';
import { useAuth } from '@/stores/authStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Usuarios from './pages/Usuarios/Usuarios';
import Usuario from './pages/Usuarios/Usuario';
import Tractors from './pages/Tractores/Tractores';
import Choferes from './pages/Choferes/Choferes';
import Servicios from './pages/Servicios/Servicios';
import Viajes from './pages/Viajes/Viajes';
import Semirremolques from './pages/Semirremolques/Semirremolques';
import Chofer from './pages/Choferes/Chofer';
import Tractor from './pages/Tractores/Tractor';
import Servicio from './pages/Servicios/Servicio';
import Viaje from './pages/Viajes/Viaje';
import Semirremolque from './pages/Semirremolques/Semirremolque';
import { ProtectedRoute } from './components/ProtectedRoute';

// Página de acceso denegado
const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
      <p className="text-lg mb-6">No tienes permisos para acceder a esta página.</p>
      <button 
        onClick={() => window.history.back()} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Volver
      </button>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const setUser = useAuth((s) => s.setUser);
  
  // Cargar usuario si hay token (reemplaza la funcionalidad de AppInit)
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    // Si no hay token, limpiar cualquier usuario persistido y terminar
    if (!token) {
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
      return;
    }

    // Hidratar desde localStorage (solo si hay token) para evitar parpadeos
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem("user");
    }

    const loadUser = async () => {
      try {

        const userData = await getCurrentUser();

        setUser(userData);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem("authToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [setUser]);

  return (
    <BrowserRouter>

    {loading ? (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ) : (
      <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        <Route path="/setup" element={<Setup />} />
        {/* Si ya está autenticado, no permitir ver el login */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/403" element={<AccessDenied />} />
        
        {/* Rutas protegidas que requieren autenticación */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tractores" element={<Tractors />} />
            <Route path="choferes" element={<Choferes />} />
            <Route path="servicios" element={<Servicios />} />
            <Route path="viajes" element={<Viajes />} />
            <Route path="semirremolques" element={<Semirremolques />} />
            <Route path="chofer/:id" element={<Chofer />} />
            <Route path="tractor/:id" element={<Tractor />} />
            <Route path="servicio/:id" element={<Servicio />} />
            <Route path="viaje/:id" element={<Viaje />} />
            <Route path="semirremolque/:id" element={<Semirremolque />} />
          </Route>
        </Route>
        
        {/* Rutas protegidas solo para administradores */}
        <Route element={<ProtectedRoute roles={['admin', 'administrador']} />}>
          <Route path="/" element={<Layout />}>
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="usuario/:id" element={<Usuario />} />
          </Route>
        </Route>
        
        {/* Ruta para cualquier otra URL no definida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </>
    )}
    </BrowserRouter>
  );
}

export default App;
