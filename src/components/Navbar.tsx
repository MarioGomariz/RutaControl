import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearUserSession } from "../utils/auth";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserSession, User as AuthUser } from "@/utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getUserSession();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }
    
    loadUser();
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "administrador";
  // We only need to check for admin role since non-admins (including choferes) only see Viajes
  
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
    <nav className="bg-navbar text-white p-3 sm:p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">
          <Link to="/">
            <img src="/logo1.png" alt="Logo" className="w-16 sm:w-20" />
          </Link>
        </div>
        
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
        <ul className="hidden md:flex space-x-8 items-center">
          <li>
            <Link 
              to="/" 
              className={`hover:text-gray-300 ${isActive('/') ? 'text-primary font-bold' : ''}`}
            >
              Inicio
            </Link>
          </li>
          
          {/* Admin-only navigation links */}
          {isAdmin && (
            <>
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
                  to="/semirremolques" 
                  className={`hover:text-gray-300 ${isActive('/semirremolques') ? 'text-primary font-bold' : ''}`}
                >
                  Semirremolques
                </Link>
              </li>
              <li>
                <Link 
                  to="/usuarios" 
                  className={`hover:text-gray-300 ${isActive('/usuarios') ? 'text-primary font-bold' : ''}`}
                >
                  Usuarios
                </Link>
              </li>
            </>
          )}
          
          {/* Link visible to all users */}
          <li>
            <Link 
              to="/viajes" 
              className={`hover:text-gray-300 ${isActive('/viajes') ? 'text-primary font-bold' : ''}`}
            >
              Viajes
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="cursor-pointer flex items-center bg-red-600 hover:bg-red-700 text-white p-2 rounded"
            >
              <LogOut size={24} />
            </button>
          </li>
        </ul>
      </div>
      
      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-navbar rounded-lg shadow-lg z-50 absolute left-0 right-0 mx-4">
          <ul className="flex flex-col space-y-3 p-4 divide-y divide-gray-700">
            <li>
              <Link 
                to="/" 
                className={`block hover:text-gray-300 ${isActive('/') ? 'text-primary font-bold' : ''}`}
                onClick={closeMenu}
              >
                Inicio
              </Link>
            </li>
            
            {/* Admin-only mobile navigation links */}
            {isAdmin && (
              <>
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
                    to="/semirremolques" 
                    className={`block hover:text-gray-300 ${isActive('/semirremolques') ? 'text-primary font-bold' : ''}`}
                    onClick={closeMenu}
                  >
                    Semirremolques
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/usuarios" 
                    className={`block hover:text-gray-300 ${isActive('/usuarios') ? 'text-primary font-bold' : ''}`}
                    onClick={closeMenu}
                  >
                    Usuarios
                  </Link>
                </li>
              </>
            )}
            
            {/* Link visible to all users */}
            <li>
              <Link 
                to="/viajes" 
                className={`block hover:text-gray-300 ${isActive('/viajes') ? 'text-primary font-bold' : ''}`}
                onClick={closeMenu}
              >
                Viajes
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