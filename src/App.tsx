import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import { isLoggedIn } from './utils/auth';
import Tractors from './pages/Tractores';
import Choferes from './pages/Choferes';
import Servicios from './pages/Servicios';
import Cargas from './pages/Cargas';

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
          <Route path="cargas" element={<Cargas />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
