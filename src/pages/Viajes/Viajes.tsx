import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useViajesStore } from "@/stores/viajesStore";

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
        : viajes.filter(viaje => viaje.estado_viaje === filtroEstado);

    // Función para obtener una clase de color según el estado del viaje
    const getEstadoClass = (estado: string) => {
        switch (estado) {
            case 'Programado':
                return 'bg-blue-100 text-blue-800';
            case 'En curso':
                return 'bg-yellow-100 text-yellow-800';
            case 'Finalizado':
                return 'bg-green-100 text-green-800';
            case 'Cancelado':
                return 'bg-red-100 text-red-800';
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
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Viajes</h1>
            <p className="text-gray-700">Gestionar viajes</p>

            {/* Filtros de estado */}
            <div className="w-full max-w-4xl mt-6 mb-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    <button 
                        onClick={() => setFiltroEstado('todos')}
                        className={`px-4 py-2 rounded-full ${filtroEstado === 'todos' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('Programado')}
                        className={`px-4 py-2 rounded-full ${filtroEstado === 'Programado' ? 'bg-primary text-white' : 'bg-blue-100 text-blue-700'}`}
                    >
                        Programados
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('En curso')}
                        className={`px-4 py-2 rounded-full ${filtroEstado === 'En curso' ? 'bg-primary text-white' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                        En curso
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('Finalizado')}
                        className={`px-4 py-2 rounded-full ${filtroEstado === 'Finalizado' ? 'bg-primary text-white' : 'bg-green-100 text-green-700'}`}
                    >
                        Finalizados
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('Cancelado')}
                        className={`px-4 py-2 rounded-full ${filtroEstado === 'Cancelado' ? 'bg-primary text-white' : 'bg-red-100 text-red-700'}`}
                    >
                        Cancelados
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-32 mt-10">
                    <p className="text-gray-500">Cargando viajes...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-10" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            ) : (
                <div className="mt-10 grid grid-cols-1 gap-4 w-full max-w-4xl">
                    <Card card={{ nuevo: true, title: "Agregar viaje", link: "/viaje/new" }} />

                    {viajesFiltrados.length > 0 ? (
                        viajesFiltrados.map((viaje) => (
                            <div key={viaje.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">{viaje.origen} → {viaje.destino}</h3>
                                        <p className="text-sm text-gray-600">
                                            Salida: {formatearFecha(viaje.fecha_salida)}
                                        </p>
                                        {viaje.fecha_llegada && (
                                            <p className="text-sm text-gray-600">
                                                Llegada: {formatearFecha(viaje.fecha_llegada)}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoClass(viaje.estado_viaje)}`}>
                                        {viaje.estado_viaje}
                                    </span>
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            {viaje.alcance_servicio} • {viaje.tipo_servicio}
                                        </p>
                                        {viaje.kilometros_recorridos && (
                                            <p className="text-sm text-gray-600">
                                                {viaje.kilometros_recorridos} km
                                            </p>
                                        )}
                                    </div>
                                    <a 
                                        href={`/viaje/${viaje.id}`}
                                        className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Ver detalles
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No se encontraron viajes {filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : ''}.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}