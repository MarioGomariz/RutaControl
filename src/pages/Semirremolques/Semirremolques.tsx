import Card from "@/components/ui/Card";
import { getAllSemirremolques } from "@/utils/semirremolques";
import { useEffect, useState } from "react";
import { Semirremolque } from "@/utils/semirremolques";

export default function Semirremolques() {
    const [semirremolques, setSemirremolques] = useState<Semirremolque[]>([]);

    useEffect(() => {
        // Load semirremolques data when component mounts
        const data = getAllSemirremolques();
        setSemirremolques(data);
    }, []);

    return (
        <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Semirremolques</h1>
            <p className="text-lg text-gray-700 mb-8 text-center">Gestionar flota de semirremolques</p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 justify-items-center">
                <Card card={{ nuevo: true, title: "Agregar semirremolque", link: "/semirremolque/new" }} />

                {semirremolques.map((semirremolque, index) => (
                    <Card 
                        key={index} 
                        card={{ 
                            title: semirremolque.nombre, 
                            description: `Dominio: ${semirremolque.dominio}`, 
                            link: `/semirremolque/${semirremolque.id}` 
                        }} 
                    />
                ))}
            </div>
        </div>
    );
}