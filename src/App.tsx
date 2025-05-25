import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import { isLoggedIn } from './utils/auth';
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
  const isAuthenticated = isLoggedIn();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
