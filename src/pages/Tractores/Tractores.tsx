import Card from "@/components/ui/Card";
import { getAllTractores } from "@/utils/tractores";
import { useEffect, useState } from "react";
import { Tractor } from "@/utils/tractores";

export default function Tractores() {
    const [tractores, setTractores] = useState<Tractor[]>([]);

    useEffect(() => {
        // Load tractores data when component mounts
        const data = getAllTractores();
        setTractores(data);
    }, []);

    return (
        <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Tractores</h1>
            <p className="text-gray-700">Gestionar flota de tractores</p>

            <div className="mt-10 grid md:grid-cols-4 sm:grid-cols-3 gap-20">
                <Card card={{ nuevo: true, title: "Agregar tractor", link: "/tractor/new" }} />

                {tractores.map((tractor, index) => (
                    <Card 
                        key={index} 
                        card={{ 
                            title: `${tractor.marca} ${tractor.modelo}`, 
                            description: `Dominio: ${tractor.dominio} - ${tractor.tipoServicio}`, 
                            link: `/tractor/${tractor.id}` 
                        }} 
                    />
                ))}
            </div>
        </div>
    );
}