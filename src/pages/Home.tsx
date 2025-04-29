import Card from "@/components/ui/Card";


export default function Home() {

  const cards = [
    {
      title: "Tractores",
      description: "Gestionar tractors",
      link: "/tractores"
    },
    {
      title: "Choferes",
      description: "Gestionar choferes",
      link: "/choferes"
    },
    {
      title: "Servicios",
      description: "Gestionar servicios",
      link: "/servicios"
    },
    {
      title: "Cargas",
      description: "Gestionar cargas",
      link: "/cargas"
    }
  ]

  return (
    <div className=" mx-auto p-4 flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4 ">Página de Inicio</h1>
        <p className="">Bienvenido a la aplicación de Ruta Control</p>

        <div className="mt-10 grid md:grid-cols-4 sm:grid-cols-3 gap-20">
            {cards.map((card, index) => (
                <Card key={index} title={card.title} description={card.description} link={card.link} />
            ))}
        </div>
    </div>
  );
}
