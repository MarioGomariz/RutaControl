import Card from "@/components/ui/Card";
import { useEffect } from "react";
import { useChoferesStore } from "@/stores/choferesStore";


export default function Choferes() {
    const { choferes, isLoading, error, fetchChoferes } = useChoferesStore();

    useEffect(() => {
        // Load choferes data when component mounts
        fetchChoferes();
    }, [fetchChoferes]);

    return (
        <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Choferes</h1>
            <p className="text-gray-700">Gestionar choferes</p>

            {isLoading ? (
                <div className="flex justify-center items-center h-32 mt-10">
                    <p className="text-gray-500">Cargando choferes...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-10" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            ) : (
                <div className="mt-10 grid md:grid-cols-4 sm:grid-cols-3 gap-20">
                    <Card card={{ nuevo: true, title: "Agregar chofer", link: "/chofer/new" }} />

                    {choferes.map((chofer) => (
                        <Card key={chofer.id} card={{ title: chofer.nombre, description: chofer.apellido, link: `/chofer/${chofer.id}` }} />
                    ))}
                    
                    {choferes.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No se encontraron choferes.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}