import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearUserSession } from "../utils/auth";
import { LogOut } from "lucide-react";


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    clearUserSession();
    navigate("/login");
  };
  return (
    <nav className="bg-background-2 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Ruta Control</div>
        <ul className="flex space-x-4 items-center">
          <li>
            <Link 
              to="/" 
              className={`hover:text-gray-300 ${isActive('/') ? 'text-primary font-bold' : ''}`}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link 
              to="/tractores" 
              className={`hover:text-gray-300 ${isActive('/tractores') ? 'text-primary font-bold' : ''}`}
            >
              Tractores
            </Link>
          </li>
          <li>
            <Link 
              to="/choferes" 
              className={`hover:text-gray-300 ${isActive('/choferes') ? 'text-primary font-bold' : ''}`}
            >
              Choferes
            </Link>
          </li>
          <li>
            <Link 
              to="/servicios" 
              className={`hover:text-gray-300 ${isActive('/servicios') ? 'text-primary font-bold' : ''}`}
            >
              Servicios
            </Link>
          </li>
          <li>
            <Link 
              to="/cargas" 
              className={`hover:text-gray-300 ${isActive('/cargas') ? 'text-primary font-bold' : ''}`}
            >
              Cargas
            </Link>
          </li>

          <li>
            <button
              onClick={handleLogout}
              className="cursor-pointer flex items-center bg-red-600 hover:bg-red-700 text-white p-2 rounded"
            >
              <LogOut />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}