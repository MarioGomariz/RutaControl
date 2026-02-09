import { useEffect, useState } from "react";
import { useTractoresStore } from "@/stores/tractoresStore";
import { Link } from "react-router-dom";
import { FaPlus, FaTruck, FaIdCard, FaCalendar, FaCogs, FaSearch, FaExclamationTriangle, FaClock, FaCheckCircle } from "react-icons/fa";
import { formatDate } from "@/utils/formatDate";
import type { Tractor } from "@/types/tractor";
import { getDaysUntilExpiration } from "@/utils/semirremolqueDocumentation";
import { formatMatricula, formatNombrePropio } from "@/utils/inputNormalizers";
import { useAuth } from "@/stores/authStore";
import { hasPermission } from "@/utils/permissions";

type FiltroVencimiento = 'todos' | 'vencidos' | 'proximos';

export default function Tractores() {
    const { tractores, isLoading, error, fetchTractores } = useTractoresStore();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroVencimiento, setFiltroVencimiento] = useState<FiltroVencimiento>('todos');
    
    // Mapeo de roles string a rol_id
    const roleToId: Record<string, number> = {
        'administrador': 1,
        'admin': 1,
        'chofer': 2,
        'analista': 3,
        'logistico': 4,
    };
    
    const rolId = user ? roleToId[user.role] || 0 : 0;
    const canCreate = hasPermission(rolId, 'create_tractores');

    useEffect(() => {
        fetchTractores();
    }, [fetchTractores]);

    const filteredTractores = tractores.filter(tractor => {
        // Filtro de búsqueda
        const matchesSearch = tractor && (
            tractor.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tractor.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tractor.dominio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tractor.tipo_servicio?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!matchesSearch) return false;

        // Filtro de vencimiento
        if (filtroVencimiento === 'todos') return true;

        if (tractor.vencimiento_rto) {
            const days = getDaysUntilExpiration(tractor.vencimiento_rto);
            if (days !== null) {
                if (filtroVencimiento === 'vencidos') {
                    return days <= 0;
                } else if (filtroVencimiento === 'proximos') {
                    return days > 0 && days <= 30;
                }
            }
        }

        return false;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Tractores</h1>
                    <p className="text-gray-600 mt-1">Gestión de la flota de tractores</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por marca, modelo, dominio..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {canCreate && (
                        <Link to="/tractor/new" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                            <FaPlus />
                            <span>Agregar Tractor</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Filtros de vencimiento */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setFiltroVencimiento('todos')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        filtroVencimiento === 'todos'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <FaCheckCircle />
                    Todos
                </button>
                <button
                    onClick={() => setFiltroVencimiento('vencidos')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        filtroVencimiento === 'vencidos'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <FaExclamationTriangle />
                    Vencidos
                </button>
                <button
                    onClick={() => setFiltroVencimiento('proximos')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        filtroVencimiento === 'proximos'
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <FaClock />
                    Próximos a vencer
                </button>
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
            ) : filteredTractores.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    {searchTerm ? (
                        <>
                            <FaSearch className="mx-auto text-4xl text-gray-400 mb-3" />
                            <p className="text-gray-500 text-lg">No se encontraron tractores que coincidan con "{searchTerm}"</p>
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="mt-3 text-blue-500 hover:text-blue-700"
                            >
                                Limpiar búsqueda
                            </button>
                        </>
                    ) : (
                        <>
                            <FaTruck className="mx-auto text-4xl text-gray-400 mb-3" />
                            <p className="text-gray-500 text-lg">No hay tractores registrados</p>
                            <Link to="/tractor/new" className="mt-3 text-blue-500 hover:text-blue-700 inline-block">
                                Agregar un tractor
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTractores.map((tractor) => (
                        <TractorCard key={tractor.id} tractor={tractor} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Componente de tarjeta de tractor mejorado
function TractorCard({ tractor }: { tractor: Tractor }) {
    // Calcular si el RTO está próximo a vencer (30 días) o vencido
    const rtoDate = tractor.vencimiento_rto ? new Date(tractor.vencimiento_rto) : null;
    const today = new Date();
    const daysUntilRto = rtoDate ? Math.ceil((rtoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isRtoExpiringSoon = daysUntilRto !== null && daysUntilRto <= 30 && daysUntilRto > 0;
    const isRtoExpired = daysUntilRto !== null && daysUntilRto <= 0;
    
    // Determinar el estado del tractor (considerando vencimientos)
    const isDisponible = tractor.estado === 'disponible' && !isRtoExpired;
    const isEnViaje = tractor.estado === 'en viaje';
    const isEnReparacion = tractor.estado === 'en reparacion';
    const isFueraDeServicio = tractor.estado === 'fuera de servicio';
    const isNoDisponible = tractor.estado === 'disponible' && isRtoExpired;
    
    // Determinar el color del borde según el estado
    const getBorderColor = () => {
        if (isFueraDeServicio) return 'border-gray-400';
        if (isEnReparacion) return 'border-orange-400';
        if (isEnViaje) return 'border-blue-400';
        if (isRtoExpired) return 'border-red-500';
        if (isRtoExpiringSoon) return 'border-amber-500';
        return 'border-green-500';
    };
    
    return (
        <Link to={`/tractor/${tractor.id}`} className="block">
            <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 hover:shadow-lg transition-shadow ${getBorderColor()}`}>
                <div className="p-5">
                    {/* Badge de disponibilidad */}
                    <div className="mb-3">
                        {isDisponible && (
                            <span className="inline-flex px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium mb-2">
                                ✓ Disponible
                            </span>
                        )}
                        {isEnViaje && (
                            <span className="inline-flex px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium mb-2">
                                🚚 En viaje
                            </span>
                        )}
                        {isEnReparacion && (
                            <span className="inline-flex px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium mb-2">
                                🔧 En reparación
                            </span>
                        )}
                        {isFueraDeServicio && (
                            <span className="inline-flex px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 font-medium mb-2">
                                🚫 Fuera de servicio
                            </span>
                        )}
                        {isNoDisponible && (
                            <span className="inline-flex px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium mb-2">
                                ❌ No disponible
                            </span>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <h3 className="font-bold text-lg text-gray-800 truncate">
                            {formatNombrePropio(tractor.marca)} {formatNombrePropio(tractor.modelo)}
                        </h3>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                            <FaIdCard className="mr-2 text-gray-500" />
                            <span>{tractor.dominio ? formatMatricula(tractor.dominio) : 'Sin dominio'}</span>
                        </div>
                        
                        {tractor.anio && (
                            <div className="flex items-center text-gray-600">
                                <FaCalendar className="mr-2 text-gray-500" />
                                <span>Año: {tractor.anio}</span>
                            </div>
                        )}
                        
                        {tractor.tipo_servicio && (
                            <div className="flex items-center text-gray-600">
                                <FaCogs className="mr-2 text-gray-500" />
                                <span>{formatNombrePropio(tractor.tipo_servicio)}</span>
                            </div>
                        )}
                    </div>
                    
                    {rtoDate && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">RTO</p>
                                    <p className="font-medium">{formatDate(tractor.vencimiento_rto)}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isRtoExpired ? 'bg-red-100 text-red-800' : isRtoExpiringSoon ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    {isRtoExpired ? 'Vencido' : daysUntilRto === 0 ? 'Vence hoy' : daysUntilRto === 1 ? 'Vence mañana' : isRtoExpiringSoon ? `${daysUntilRto} días` : 'Vigente'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}