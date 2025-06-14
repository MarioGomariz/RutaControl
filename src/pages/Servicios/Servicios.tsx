// Importaciones necesarias
import { useEffect } from "react";
import { useServiciosStore } from "@/stores/serviciosStore";
import { Link } from "react-router-dom";

export default function Servicios() {
    const { servicios, isLoading, error, fetchServicios } = useServiciosStore();

    useEffect(() => {
        // Load servicios data when component mounts
        fetchServicios();
    }, [fetchServicios]);

    return (
        <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
            <div className="w-full max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
                        <p className="text-gray-600">Gestionar servicios de transporte</p>
                    </div>
                    <Link 
                        to="/servicio/new"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Nuevo Servicio
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-gray-500">Cargando servicios...</p>
                    </div>
                ) : servicios.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600">No hay servicios registrados</p>
                        <Link 
                            to="/servicio/new"
                            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Crear el primer servicio
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servicios.map((servicio) => (
                            <div 
                                key={servicio.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {servicio.descripcion}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Fecha: {new Date(servicio.fecha_creacion).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {servicio.requiere_prueba_hidraulica && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Prueba Hidráulica</span>
                                            )}
                                            {servicio.requiere_visuales && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Visuales</span>
                                            )}
                                            {servicio.requiere_valvula_y_mangueras && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Válvulas y Mangueras</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <Link 
                                            to={`/servicio/${servicio.id}`}
                                            className="text-primary hover:text-blue-700 font-medium text-sm"
                                        >
                                            Ver detalles →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}