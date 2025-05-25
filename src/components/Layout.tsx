
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-center bg-cover bg-fixed overflow-x-hidden"
      style={{ backgroundImage: `url('/bg.png')` }}>
        <div className="px-2 sm:px-4 md:px-6 py-4 sm:py-6 max-w-full">
          <Outlet />
        </div>
      </main>
      <footer className="bg-navbar text-white p-3 sm:p-4 text-center">
        <div className="container mx-auto">
          <p className="text-sm sm:text-base">© {new Date().getFullYear()} Ruta Control.</p>
        </div>
      </footer>
    </div>
  );
};


