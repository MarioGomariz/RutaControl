// Importaciones necesarias
import { useEffect, useState } from "react";
import { useServiciosStore } from "@/stores/serviciosStore";
import { Link } from "react-router-dom";
import { FaSearch, FaPlus, FaTools, FaClipboardCheck, FaWrench, FaInfoCircle } from "react-icons/fa";
import { Servicio } from "@/types";

// Componente para mostrar una tarjeta de servicio
function ServicioCard({ servicio }: { servicio: Servicio }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FaTools className="text-blue-600 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {servicio.descripcion}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                    {servicio.requiere_prueba_hidraulica && (
                        <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            <FaClipboardCheck size={12} />
                            <span>Prueba Hidráulica</span>
                        </div>
                    )}
                    {servicio.requiere_visuales && (
                        <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            <FaInfoCircle size={12} />
                            <span>Visuales</span>
                        </div>
                    )}
                    {servicio.requiere_valvula_y_mangueras && (
                        <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            <FaWrench size={12} />
                            <span>Válvulas y Mangueras</span>
                        </div>
                    )}
                </div>
                
                {servicio.observaciones && (
                    <div className="mt-3 text-xs text-gray-500 italic line-clamp-2">
                        {servicio.observaciones}
                    </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link 
                        to={`/servicio/${servicio.id}`}
                        className="text-primary hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                        Ver detalles <span className="text-xs">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Servicios() {
    const { servicios, isLoading, error, fetchServicios } = useServiciosStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Load servicios data when component mounts
        fetchServicios();
    }, [fetchServicios]);
    
    // Filtrar servicios según el término de búsqueda
    const filteredServicios = servicios.filter(servicio => 
        servicio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (servicio.observaciones && servicio.observaciones.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Servicios</h1>
                    <p className="text-gray-600 mt-1">Gestión de servicios de transporte</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, descripción..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <Link to="/servicio/new" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        <FaPlus />
                        <span>Agregar Servicio</span>
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            ) : filteredServicios.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    {searchTerm ? (
                        <>
                            <FaSearch className="mx-auto text-4xl text-gray-400 mb-3" />
                            <p className="text-gray-500 text-lg">No se encontraron servicios que coincidan con "{searchTerm}"</p>
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="mt-3 text-blue-500 hover:text-blue-700"
                            >
                                Limpiar búsqueda
                            </button>
                        </>
                    ) : (
                        <>
                            <FaTools className="mx-auto text-4xl text-gray-400 mb-3" />
                            <p className="text-gray-500 text-lg">No hay servicios registrados</p>
                            <Link to="/servicio/new" className="mt-3 text-blue-500 hover:text-blue-700 inline-block">
                                Agregar un servicio
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServicios.map((servicio) => (
                        <ServicioCard key={servicio.id} servicio={servicio} />
                    ))}
                </div>
            )}
        </div>
    );
}