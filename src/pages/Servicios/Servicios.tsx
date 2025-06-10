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
                                            <h3 className="text-lg font-semibold">{servicio.origen} → {servicio.destino}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Fecha: {new Date(servicio.fecha_inicio).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(servicio.estado as 'pendiente' | 'en_curso' | 'completado' | 'cancelado')}`}>
                                            {getStatusText(servicio.estado as 'pendiente' | 'en_curso' | 'completado' | 'cancelado')}
                                        </span>
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

// Función auxiliar para obtener el color según el estado
function getStatusColor(estado: 'pendiente' | 'en_curso' | 'completado' | 'cancelado'): string {
    switch (estado) {
        case 'pendiente':
            return 'bg-yellow-100 text-yellow-800';
        case 'en_curso':
            return 'bg-blue-100 text-blue-800';
        case 'completado':
            return 'bg-green-100 text-green-800';
        case 'cancelado':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Función auxiliar para obtener el texto según el estado
function getStatusText(estado: 'pendiente' | 'en_curso' | 'completado' | 'cancelado'): string {
    switch (estado) {
        case 'pendiente':
            return 'Pendiente';
        case 'en_curso':
            return 'En curso';
        case 'completado':
            return 'Completado';
        case 'cancelado':
            return 'Cancelado';
        default:
            return estado;
    }
}