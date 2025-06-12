import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Usuarios from './pages/Usuarios/Usuarios';
import Usuario from './pages/Usuarios/Usuario';
import { isLoggedInSync, getUserSession } from './utils/auth';
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


// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = isLoggedInSync();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin route component - only accessible by administrators
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = isLoggedInSync();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        if (isAuthenticated) {
          const userData = await getUserSession();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    // Show loading while checking user role
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (user?.role !== 'admin' && user?.role !== 'administrador') {
    // Redirect to home if not an admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
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
          
          {/* Rutas protegidas solo para administradores */}
          <Route path="usuarios" element={
            <AdminRoute>
              <Usuarios />
            </AdminRoute>
          } />
          <Route path="usuario/:id" element={
            <AdminRoute>
              <Usuario />
            </AdminRoute>
          } />

        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
