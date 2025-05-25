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
        <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Semirremolques</h1>
            <p className="text-gray-700">Gestionar flota de semirremolques</p>

            <div className="mt-10 grid md:grid-cols-4 sm:grid-cols-3 gap-20">
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