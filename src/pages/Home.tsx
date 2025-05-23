import Card from "@/components/ui/Card";
import { Combine, MapPin, Truck, User } from "lucide-react";


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
      title: "Viajes",
      description: "Gestionar viajes",
      link: "/viajes",
      icon: <MapPin size={56} className="text-primary" />
    }
  ]

  return (
    <div className=" mx-auto p-4 flex flex-col mt-16 items-center justify-center text-dark">
        <h1 className="text-2xl font-bold mb-4 ">Página de Inicio</h1>
        <p className="">Bienvenido a la aplicación de Ruta Control</p>

        <div className="mt-10 grid md:grid-cols-4 sm:grid-cols-3 gap-20">
            {cards.map((card, index) => (
                <Card key={index} card={card} />
            ))}
        </div>
    </div>
  );
}
