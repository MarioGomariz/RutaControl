import Card from "@/components/ui/Card";
import { useEffect } from "react";
import { useTractoresStore } from "@/stores/tractoresStore";

export default function Tractores() {
    const { tractores, isLoading, error, fetchTractores } = useTractoresStore();

    useEffect(() => {
        // Load tractores data when component mounts
        fetchTractores();
    }, [fetchTractores]);

    return (
        <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Tractores</h1>
            <p className="text-gray-700">Gestionar flota de tractores</p>

            {isLoading ? (
                <div className="flex justify-center items-center h-32 mt-10">
                    <p className="text-gray-500">Cargando tractores...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-10" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            ) : (
                <div className="mt-10 grid md:grid-cols-4 sm:grid-cols-3 gap-20">
                    <Card card={{ nuevo: true, title: "Agregar tractor", link: "/tractor/new" }} />

                    {tractores.map((tractor) => (
                        <Card 
                            key={tractor.id} 
                            card={{ 
                                title: `${tractor.marca} ${tractor.modelo}`, 
                                description: `Dominio: ${tractor.dominio} - ${tractor.tipo_servicio}`, 
                                link: `/tractor/${tractor.id}` 
                            }} 
                        />
                    ))}
                    
                    {tractores.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No se encontraron tractores.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}