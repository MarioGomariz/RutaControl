import Card from "@/components/ui/Card";
import { getAllChoferes } from "@/utils/choferes";
import { useEffect, useState } from "react";
import { Chofer } from "@/utils/choferes";

export default function Choferes() {
    const [choferes, setChoferes] = useState<Chofer[]>([]);

    useEffect(() => {
        // Load choferes data when component mounts
        const data = getAllChoferes();
        setChoferes(data);
    }, []);

    return (
        <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Choferes</h1>
            <p className="text-gray-700">Gestionar choferes</p>

            <div className="mt-10 grid md:grid-cols-4 sm:grid-cols-3 gap-20">
                <Card card={{ nuevo: true, title: "Agregar chofer", link: "/chofer/new" }} />

                {choferes.map((chofer, index) => (
                    <Card key={index} card={{ title: chofer.nombre, description: chofer.apellido, link: `/chofer/${chofer.id}` }} />
                ))}
            </div>
        </div>
    );
}