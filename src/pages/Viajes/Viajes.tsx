import { useEffect, useState } from "react";
import { useViajesStore } from "@/stores/viajesStore";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt, FaTruck, FaRoute, FaPlus } from "react-icons/fa";

export default function Viajes() {
    const { viajes, isLoading, error, fetchViajes } = useViajesStore();
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');

    useEffect(() => {
        // Cargar viajes cuando el componente se monta
        fetchViajes();
    }, [fetchViajes]);

    // Filtrar viajes por estado
    const viajesFiltrados = filtroEstado === 'todos'
        ? viajes
        : viajes.filter(viaje => viaje.estado === filtroEstado.toLowerCase());

    // Función para obtener una clase de color según el estado del viaje
    const getEstadoClass = (estado: string) => {
        switch (estado) {
            case 'programado':
                return 'bg-blue-100 text-blue-800';
            case 'en curso':
                return 'bg-yellow-100 text-yellow-800';
            case 'finalizado':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Función para formatear la fecha
    const formatearFecha = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
            <div className="w-full max-w-4xl mb-8">
                <h1 className="text-3xl font-bold mb-2 text-gray-800 text-center">Viajes</h1>
                <p className="text-gray-600 text-center mb-6">Gestión de viajes y rutas</p>

                {/* Filtros de estado */}
                <div className="flex flex-wrap gap-2 justify-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                    <button 
                        onClick={() => setFiltroEstado('todos')}
                        className={`px-6 py-2 rounded-full transition-all duration-200 font-medium ${filtroEstado === 'todos' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('programado')}
                        className={`px-6 py-2 rounded-full transition-all duration-200 font-medium ${filtroEstado === 'Programado' ? 'bg-primary text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                    >
                        Programados
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('en curso')}
                        className={`px-6 py-2 rounded-full transition-all duration-200 font-medium ${filtroEstado === 'En curso' ? 'bg-primary text-white shadow-md' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                    >
                        En curso
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('finalizado')}
                        className={`px-6 py-2 rounded-full transition-all duration-200 font-medium ${filtroEstado === 'Finalizado' ? 'bg-primary text-white shadow-md' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                        Finalizados
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-32 bg-white rounded-lg shadow-sm p-8 w-full max-w-4xl">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-3"></div>
                        <p className="text-gray-500 font-medium">Cargando viajes...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm w-full max-w-4xl" role="alert">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="font-bold">Error al cargar los viajes</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-4xl">
                    <Link to="/viaje/new" className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 hover:border-primary hover:text-primary transition-all duration-200 group">
                        <FaPlus className="text-xl group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-lg font-medium">Agregar nuevo viaje</span>
                    </Link>

                    {viajesFiltrados.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {viajesFiltrados.map((viaje) => (
                                <div key={viaje.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <FaMapMarkerAlt className="text-primary mr-2" />
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {viaje.origen} ({viaje.alcance})
                                                    </h3>
                                                </div>
                                                <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <FaCalendarAlt className="mr-1 text-gray-500" />
                                                        <span>Salida: {formatearFecha(viaje.fecha_hora_salida)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoClass(viaje.estado)}`}>
                                                {viaje.estado}
                                            </span>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <FaTruck className="mr-1 text-gray-500" />
                                                <span>Servicio ID: {viaje.servicio_id}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaRoute className="mr-1 text-gray-500" />
                                                <span>Alcance: {viaje.alcance}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end">
                                            <Link 
                                                to={`/viaje/${viaje.id}`}
                                                className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                            >
                                                Ver detalles
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 17l-5-5 5-5m6 10l5-5-5-5" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay viajes disponibles</h3>
                            <p className="mt-1 text-gray-500">
                                No se encontraron viajes {filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : ''}.                                
                            </p>
                            <div className="mt-6">
                                <Link to="/viaje/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700">
                                    <FaPlus className="mr-2" />
                                    Crear nuevo viaje
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}