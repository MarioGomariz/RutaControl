import Card from "@/components/ui/Card";
import { useEffect } from "react";
import { useSemirremolquesStore } from "@/stores/semirremolquesStore";


export default function Semirremolques() {
    const { semirremolques, isLoading, error, fetchSemirremolques } = useSemirremolquesStore();

    useEffect(() => {
        // Load semirremolques data when component mounts
        fetchSemirremolques();
    }, [fetchSemirremolques]);

    return (
        <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Semirremolques</h1>
            <p className="text-lg text-gray-700 mb-8 text-center">Gestionar flota de semirremolques</p>

            {isLoading ? (
                <div className="flex justify-center items-center h-32 mt-10">
                    <p className="text-gray-500">Cargando semirremolques...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-10" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 justify-items-center">
                    <Card card={{ nuevo: true, title: "Agregar semirremolque", link: "/semirremolque/new" }} />

                    {semirremolques.map((semirremolque) => (
                        <Card 
                            key={semirremolque.id} 
                            card={{ 
                                title: semirremolque.nombre, 
                                description: `Dominio: ${semirremolque.dominio}`, 
                                link: `/semirremolque/${semirremolque.id}` 
                            }} 
                        />
                    ))}
                    
                    {semirremolques.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No se encontraron semirremolques.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}