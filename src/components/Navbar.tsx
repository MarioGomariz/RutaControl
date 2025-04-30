import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearUserSession } from "../utils/auth";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    clearUserSession();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  return (
    <nav className="bg-background-2 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Ruta Control</div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Desktop menu */}
        <ul className="hidden md:flex space-x-4 items-center">
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
              <LogOut size={18} />
            </button>
          </li>
        </ul>
      </div>
      
      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-background-2 rounded-lg shadow-lg">
          <ul className="flex flex-col space-y-3 p-4">
            <li>
              <Link 
                to="/" 
                className={`block hover:text-gray-300 ${isActive('/') ? 'text-primary font-bold' : ''}`}
                onClick={closeMenu}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link 
                to="/tractores" 
                className={`block hover:text-gray-300 ${isActive('/tractores') ? 'text-primary font-bold' : ''}`}
                onClick={closeMenu}
              >
                Tractores
              </Link>
            </li>
            <li>
              <Link 
                to="/choferes" 
                className={`block hover:text-gray-300 ${isActive('/choferes') ? 'text-primary font-bold' : ''}`}
                onClick={closeMenu}
              >
                Choferes
              </Link>
            </li>
            <li>
              <Link 
                to="/servicios" 
                className={`block hover:text-gray-300 ${isActive('/servicios') ? 'text-primary font-bold' : ''}`}
                onClick={closeMenu}
              >
                Servicios
              </Link>
            </li>
            <li>
              <Link 
                to="/cargas" 
                className={`block hover:text-gray-300 ${isActive('/cargas') ? 'text-primary font-bold' : ''}`}
                onClick={closeMenu}
              >
                Cargas
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white p-2 rounded"
              >
                <LogOut size={18} className="mr-2" />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}