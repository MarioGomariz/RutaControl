import { useEffect, useState } from "react";
import { useViajesStore } from "@/stores/viajesStore";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt, FaTruck, FaRoute, FaPlus, FaMapMarked, FaDownload } from "react-icons/fa";
import { useAuth } from "@/stores/authStore";
import { useParadasStore } from "@/stores";
import { generarPDFViaje } from "@/utils/pdfGenerator";
import { toast } from "react-toastify";
import { formatDate } from "@/utils/formatDate";

export default function Viajes() {
    const { viajes, isLoading, error, fetchViajes, fetchViajesByChofer } = useViajesStore();
    const { exportarParadas } = useParadasStore();
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const { user } = useAuth();
    
    const handleDescargarPDF = async (viajeId: number) => {
        try {
            const data = await exportarParadas(String(viajeId));
            generarPDFViaje(data);
            toast.success("PDF generado exitosamente");
        } catch (error: any) {
            console.error('Error al generar PDF:', error);
            toast.error("Error al generar el PDF");
        }
    };

    useEffect(() => {
        // Cargar viajes según el rol del usuario
        if (user?.role === 'chofer') {
            // Un chofer solo ve sus propios viajes
            if (user.id) {
                fetchViajesByChofer(user.id);
            }
        } else {
            // Admin u otros roles ven todos los viajes
            fetchViajes();
        }
    }, [user, fetchViajes, fetchViajesByChofer]);

    // Filtrar viajes por estado
    const baseViajes = user?.role === 'chofer'
        ? viajes.filter(v => v.chofer_id === user.id)
        : viajes;
    const viajesFiltrados = filtroEstado === 'todos'
        ? baseViajes
        : baseViajes.filter(viaje => viaje.estado === filtroEstado.toLowerCase());

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
                        className={`px-6 py-2 rounded-full transition-all duration-200 font-medium ${filtroEstado === 'programado' ? 'bg-primary text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                    >
                        Programados
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('en curso')}
                        className={`px-6 py-2 rounded-full transition-all duration-200 font-medium ${filtroEstado === 'en curso' ? 'bg-primary text-white shadow-md' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                    >
                        En curso
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('finalizado')}
                        className={`px-6 py-2 rounded-full transition-all duration-200 font-medium ${filtroEstado === 'finalizado' ? 'bg-primary text-white shadow-md' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
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
                    {user?.role !== 'chofer' && (
                        <Link to="/viaje/new" className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 hover:border-primary hover:text-primary transition-all duration-200 group">
                            <FaPlus className="text-xl group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-lg font-medium">Agregar nuevo viaje</span>
                        </Link>
                    )}

                    {viajesFiltrados.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {viajesFiltrados.map((viaje) => (
                                <div key={viaje.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
                                    <div className="p-5">
                                        {/* Header con origen y estado */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <FaMapMarkerAlt className="text-primary mr-2 text-xl" />
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {viaje.origen}
                                                </h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoClass(viaje.estado)}`}>
                                                {viaje.estado}
                                            </span>
                                        </div>
                                        
                                        {/* Información principal del viaje */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                            {/* Salida */}
                                            <div className="flex items-center text-sm">
                                                <FaCalendarAlt className="mr-2 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <span className="text-gray-500 text-xs">Salida:</span>
                                                    <span className="ml-1 text-gray-800 font-medium">{formatDate(viaje.fecha_hora_salida)}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Chofer */}
                                            {(viaje as any).chofer_nombre && (
                                                <div className="flex items-center text-sm">
                                                    <FaRoute className="mr-2 text-gray-400 flex-shrink-0" />
                                                    <div>
                                                        <span className="text-gray-500 text-xs">Chofer:</span>
                                                        <span className="ml-1 text-gray-800 font-medium">
                                                            {(viaje as any).chofer_nombre} {(viaje as any).chofer_apellido}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Tractor */}
                                            {(viaje as any).tractor_marca && (
                                                <div className="flex items-center text-sm">
                                                    <FaTruck className="mr-2 text-gray-400 flex-shrink-0" />
                                                    <div>
                                                        <span className="text-gray-500 text-xs">Tractor:</span>
                                                        <span className="ml-1 text-gray-800 font-medium">
                                                            {(viaje as any).tractor_marca} {(viaje as any).tractor_modelo} - {(viaje as any).tractor_dominio}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Semirremolque */}
                                            {(viaje as any).semirremolque_nombre && (
                                                <div className="flex items-center text-sm">
                                                    <FaTruck className="mr-2 text-gray-400 flex-shrink-0" />
                                                    <div>
                                                        <span className="text-gray-500 text-xs">Semi:</span>
                                                        <span className="ml-1 text-gray-800 font-medium">
                                                            {(viaje as any).semirremolque_nombre} - {(viaje as any).semirremolque_dominio}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-end gap-3">
                                            {user?.role === 'chofer' && (
                                                <Link 
                                                    to={`/viaje/${viaje.id}/paradas`}
                                                    className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                                >
                                                    <FaMapMarked />
                                                    {viaje.estado === 'programado' ? 'Iniciar Viaje' : 'Ver Paradas'}
                                                </Link>
                                            )}
                                            
                                            {user?.role !== 'chofer' && (
                                                <>
                                                    <Link 
                                                        to={`/viaje/${viaje.id}/paradas`}
                                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                                                    >
                                                        <FaMapMarked />
                                                        Ver Paradas
                                                    </Link>
                                                    <Link 
                                                        to={`/viaje/${viaje.id}`}
                                                        className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                                    >
                                                        Ver detalles
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                    {viaje.estado === 'finalizado' && (
                                                        <button
                                                            onClick={() => handleDescargarPDF(viaje.id)}
                                                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                                                            title="Descargar reporte en PDF"
                                                        >
                                                            <FaDownload />
                                                            PDF
                                                        </button>
                                                    )}
                                                </>
                                            )}
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
                            <h3 className="mt-2 text-lg font-medium text-gray-900">
                                {user?.role === 'chofer' ? 'No tienes viajes asignados' : 'No hay viajes disponibles'}
                            </h3>
                            <p className="mt-1 text-gray-500">
                                {user?.role === 'chofer'
                                    ? 'Aún no tienes viajes asignados en el sistema.'
                                    : `No se encontraron viajes ${filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : ''}.`}
                            </p>
                            {user?.role !== 'chofer' && (
                                <div className="mt-6">
                                    <Link to="/viaje/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700">
                                        <FaPlus className="mr-2" />
                                        Crear nuevo viaje
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}