import Card from "@/components/ui/Card";
import { MapPin, Truck, User, Box, Users, BarChart3 } from "lucide-react";
import { useAuth } from "@/stores/authStore";
import { hasPermission } from "@/utils/permissions";

export default function Home() {
  const { user } = useAuth();

  // Mapeo de roles string a rol_id
  const roleToId: Record<string, number> = {
    'administrador': 1,
    'admin': 1,
    'chofer': 2,
    'analista': 3,
    'logistico': 4,
  };

  const rolId = user ? roleToId[user.role] || 0 : 0;

  // Verificar permisos
  const canViewEstadisticas = hasPermission(rolId, 'view_estadisticas');
  const canViewChoferes = hasPermission(rolId, 'view_choferes');
  const canViewTractores = hasPermission(rolId, 'view_tractores');
  const canViewSemirremolques = hasPermission(rolId, 'view_semirremolques');
  const canViewViajes = hasPermission(rolId, 'view_viajes');
  const canViewUsuarios = hasPermission(rolId, 'view_usuarios');

  // Construir array de cards según permisos
  const cards = [];

  if (canViewUsuarios) {
    cards.push({
      title: "Usuarios",
      description: "Gestionar usuarios",
      link: "/usuarios",
      icon: <Users size={56} className="text-primary" />,
    });
  }

  if (canViewChoferes) {
    cards.push({
      title: "Choferes",
      description: "Gestionar choferes",
      link: "/choferes",
      icon: <User size={56} className="text-primary" />,
    });
  }

  if (canViewTractores) {
    cards.push({
      title: "Tractores",
      description: "Gestionar tractores",
      link: "/tractores",
      icon: <Truck size={56} className="text-primary" />,
    });
  }

  if (canViewSemirremolques) {
    cards.push({
      title: "Semirremolques",
      description: "Gestionar semirremolques",
      link: "/semirremolques",
      icon: <Box size={56} className="text-primary" />,
    });
  }

  if (canViewViajes) {
    cards.push({
      title: "Viajes",
      description: "Gestionar viajes",
      link: "/viajes",
      icon: <MapPin size={56} className="text-primary" />,
    });
  }

  if (canViewEstadisticas) {
    cards.push({
      title: "Estadísticas",
      description: "Ver gráficos y métricas",
      link: "/estadisticas",
      icon: <BarChart3 size={56} className="text-primary" />,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center text-gray-800">

      <h1 className="text-3xl font-bold mb-8 text-center">
        Bienvenido a Ruta Control
      </h1>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 justify-items-center">
        {cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
    </div>
  );
}
