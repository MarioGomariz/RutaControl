
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background-0">
        <Outlet />
      </main>
      <footer className="bg-background-2 text-white p-4 text-center">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Ruta Control.</p>
        </div>
      </footer>
    </div>
  );
};


