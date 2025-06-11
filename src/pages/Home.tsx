import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Combine, MapPin, Truck, User, Box, Users } from "lucide-react";
import { getUserSession, User as AuthUser } from "@/utils/auth";

export default function Home() {
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
  const isChofer = user?.role === "chofer";

  // Define cards based on user role
  const adminCards = [
    {
      title: "Usuarios",
      description: "Gestionar usuarios",
      link: "/usuarios",
      icon: <Users size={56} className="text-primary" />,
    },
    {
      title: "Choferes",
      description: "Gestionar choferes",
      link: "/choferes",
      icon: <User size={56} className="text-primary" />,
    },
    {
      title: "Servicios",
      description: "Gestionar servicios",
      link: "/servicios",
      icon: <Combine size={56} className="text-primary" />,
    },
    {
      title: "Tractores",
      description: "Gestionar tractores",
      link: "/tractores",
      icon: <Truck size={56} className="text-primary" />,
    },
    {
      title: "Semirremolques",
      description: "Gestionar semirremolques",
      link: "/semirremolques",
      icon: <Box size={56} className="text-primary" />,
    },
    {
      title: "Viajes",
      description: "Gestionar viajes",
      link: "/viajes",
      icon: <MapPin size={56} className="text-primary" />,
    },
  ];

  const choferCards = [
    {
      title: "Viajes",
      description: "Ver y gestionar viajes",
      link: "/viajes",
      icon: <MapPin size={56} className="text-primary" />,
    },
  ];

  // Select cards based on user role
  const cards = isAdmin ? adminCards : isChofer ? choferCards : [];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-center">Página de Inicio</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Bienvenido a la aplicación de Ruta Control
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 justify-items-center">
        {cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
    </div>
  );
}
