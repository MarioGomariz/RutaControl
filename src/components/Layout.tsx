
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import bg from "../../public/bg.png"

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-center bg-cover"
      style={{ backgroundImage: `url('${bg}')` }}>
        <Outlet />
      </main>
      <footer className="bg-navbar text-white p-4 text-center">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Ruta Control.</p>
        </div>
      </footer>
    </div>
  );
};


