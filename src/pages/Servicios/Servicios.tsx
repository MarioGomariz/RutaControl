import Card from "@/components/ui/Card";
import { getAllServicios } from "@/utils/servicios";
import { useEffect, useState } from "react";
import { Servicio } from "@/utils/servicios";

export default function Servicios() {
    const [servicios, setServicios] = useState<Servicio[]>([]);

    useEffect(() => {
        // Load servicios data when component mounts
        const data = getAllServicios();
        setServicios(data);
    }, []);

    return (
        <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Servicios</h1>
            <p className="text-gray-700">Gestionar servicios de transporte</p>

            <div className="mt-10 grid md:grid-cols-4 sm:grid-cols-3 gap-20">
                <Card card={{ nuevo: true, title: "Agregar servicio", link: "/servicio/new" }} />

                {servicios.map((servicio, index) => (
                    <Card 
                        key={index} 
                        card={{ 
                            title: servicio.nombre, 
                            description: servicio.descripcion || 'Sin descripción', 
                            link: `/servicio/${servicio.id}` 
                        }} 
                    />
                ))}
            </div>
        </div>
    );
}