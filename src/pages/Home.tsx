import Card from "@/components/ui/Card";
import { Combine, MapPin, Truck, User, Box } from "lucide-react";


export default function Home() {

  const cards = [
    {
      title: "Tractores",
      description: "Gestionar tractors",
      link: "/tractores",
      icon: <Truck size={56} className="text-primary" />
    },
    {
      title: "Choferes",
      description: "Gestionar choferes",
      link: "/choferes",
      icon: <User size={56} className="text-primary" />
    },
    {
      title: "Servicios",
      description: "Gestionar servicios",
      link: "/servicios",
      icon: <Combine size={56} className="text-primary" />
    },
    {
      title: "Semirremolques",
      description: "Gestionar semirremolques",
      link: "/semirremolques",
      icon: <Box size={56} className="text-primary" />
    },
    {
      title: "Viajes",
      description: "Gestionar viajes",
      link: "/viajes",
      icon: <MapPin size={56} className="text-primary" />
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-800">
        <h1 className="text-3xl font-bold mb-4 text-center">Página de Inicio</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">Bienvenido a la aplicación de Ruta Control</p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 justify-items-center">
            {cards.map((card, index) => (
                <Card key={index} card={card} />
            ))}
        </div>
    </div>
  );
}
