import { useEffect, useState } from "react";
import { useSemirremolquesStore } from "@/stores/semirremolquesStore";
import { Link } from "react-router-dom";
import { FaPlus, FaIdCard, FaCalendar, FaWeightHanging, FaExclamationTriangle, FaTruckMoving, FaSearch, FaClock, FaCheckCircle } from "react-icons/fa";
import { Semirremolque } from "@/types/semirremolque";
import { getRequiredDocFields, getExpirationStatus, getExpirationBadgeColor, getExpirationBadgeText, DOCUMENTATION_LABELS, getDaysUntilExpiration } from "@/utils/semirremolqueDocumentation";
import { formatDate } from "@/utils/formatDate";
import { formatMatricula, formatNombrePropio } from "@/utils/inputNormalizers";
import { useAuth } from "@/stores/authStore";
import { hasPermission } from "@/utils/permissions";

type FiltroVencimiento = 'todos' | 'vencidos' | 'proximos';

export default function Semirremolques() {
    const { semirremolques, isLoading, error, fetchSemirremolques } = useSemirremolquesStore();
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
    const canCreate = hasPermission(rolId, 'create_semirremolques');

    useEffect(() => {
        fetchSemirremolques();
    }, [fetchSemirremolques]);

    const filteredSemirremolques = semirremolques.filter(semirremolque => {
        // Normalizar término de búsqueda y dominio (eliminar espacios)
        const searchNormalized = searchTerm.toLowerCase().replace(/\s+/g, '');
        const dominioNormalized = semirremolque.dominio?.toLowerCase().replace(/\s+/g, '') || '';
        
        // Filtro de búsqueda
        const matchesSearch = semirremolque.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dominioNormalized.includes(searchNormalized) ||
            semirremolque.tipo_servicio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(semirremolque.anio || '').includes(searchTerm);

        if (!matchesSearch) return false;

        // Filtro de vencimiento
        if (filtroVencimiento === 'todos') return true;

        // Verificar todos los documentos requeridos según el tipo de servicio
        if (semirremolque.tipo_servicio) {
            const requiredFields = getRequiredDocFields(semirremolque.tipo_servicio);
            
            for (const field of requiredFields) {
                const dateValue = (semirremolque as any)[field];
                if (dateValue) {
                    const days = getDaysUntilExpiration(dateValue);
                    if (days !== null) {
                        if (filtroVencimiento === 'vencidos' && days <= 0) {
                            return true;
                        } else if (filtroVencimiento === 'proximos' && days > 0 && days <= 30) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    });

    return (
        <div className="w-full max-w-7xl mx-auto p-4 flex flex-col text-gray-800">
            <div className="flex items-center gap-3 mb-2">
                <FaTruckMoving className="text-green-600 text-2xl" />
                <h1 className="text-3xl font-bold text-gray-800">Semirremolques</h1>
            </div>
            <p className="text-gray-600 mb-6 pl-9">Gestión de flota de semirremolques</p>
            
            {/* Barra de búsqueda y botón de agregar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative w-full sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, dominio, tipo o marca..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {canCreate && (
                    <Link 
                        to="/semirremolque/new"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors w-full sm:w-auto justify-center"
                    >
                        <FaPlus /> Agregar semirremolque
                    </Link>
                )}
            </div>

            {/* Filtros de vencimiento */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setFiltroVencimiento('todos')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        filtroVencimiento === 'todos'
                            ? 'bg-green-600 text-white'
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
                <div className="flex justify-center items-center h-64 w-full">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                        <p className="text-gray-500 font-medium">Cargando semirremolques...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        <strong className="font-bold">Error</strong>
                    </div>
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <>
                    {filteredSemirremolques.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 w-full">
                            <FaTruckMoving className="text-gray-300 text-5xl mb-4" />
                            <p className="text-gray-500 text-xl font-medium">
                                {searchTerm ? "No se encontraron semirremolques que coincidan con la búsqueda" : "No hay semirremolques registrados"}
                            </p>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm("")}
                                    className="mt-4 text-green-600 hover:text-green-800 font-medium"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredSemirremolques.map((semirremolque) => (
                                <SemirremolqueCard key={semirremolque.id} semirremolque={semirremolque} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Componente de tarjeta de semirremolque mejorado
function SemirremolqueCard({ semirremolque }: { semirremolque: Semirremolque }) {
    // Obtener los campos de documentación relevantes según el tipo de servicio
    const requiredDocFields = getRequiredDocFields(semirremolque.tipo_servicio);
    
    // Verificar si hay algún vencimiento expirado o próximo a vencer
    const hasExpiredDoc = requiredDocFields.some(field => {
        const status = getExpirationStatus(semirremolque[field as keyof Semirremolque] as string);
        return status === 'expired';
    });
    
    const hasExpiringSoonDoc = requiredDocFields.some(field => {
        const status = getExpirationStatus(semirremolque[field as keyof Semirremolque] as string);
        return status === 'expiring-soon';
    });
    
    // Determinar el estado del semirremolque (considerando vencimientos)
    const isDisponible = semirremolque.estado === 'disponible' && !hasExpiredDoc;
    const isEnViaje = semirremolque.estado === 'en viaje';
    const isEnReparacion = semirremolque.estado === 'en reparacion';
    const isFueraDeServicio = semirremolque.estado === 'fuera de servicio';
    const isNoDisponible = semirremolque.estado === 'disponible' && hasExpiredDoc;
    
    // Determinar el color del borde según el estado
    const getBorderColor = () => {
        if (isFueraDeServicio) return 'border-gray-400';
        if (isEnReparacion) return 'border-orange-400';
        if (isEnViaje) return 'border-blue-400';
        if (hasExpiredDoc) return 'border-red-500';
        if (hasExpiringSoonDoc) return 'border-amber-500';
        return 'border-green-500';
    };
    
    return (
        <Link to={`/semirremolque/${semirremolque.id}`} className="block">
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
                            {semirremolque.nombre ? formatNombrePropio(semirremolque.nombre) : 'Sin nombre'}
                        </h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                            <FaIdCard className="mr-2 text-gray-500" />
                            <span>{semirremolque.dominio ? formatMatricula(semirremolque.dominio) : 'Sin dominio'}</span>
                        </div>
                        
                        {semirremolque.anio && (
                            <div className="flex items-center text-gray-600">
                                <FaCalendar className="mr-2 text-gray-500" />
                                <span>Año: {semirremolque.anio}</span>
                            </div>
                        )}
                        
                        {semirremolque.tipo_servicio && (
                            <div className="flex items-center text-gray-600">
                                <FaWeightHanging className="mr-2 text-gray-500" />
                                <span>{formatNombrePropio(semirremolque.tipo_servicio)}</span>
                            </div>
                        )}
                    </div>
                    
                    {requiredDocFields.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2 font-semibold">Documentación</p>
                            <div className="space-y-2">
                                {requiredDocFields.map(field => {
                                    const value = semirremolque[field as keyof Semirremolque] as string;
                                    const status = getExpirationStatus(value);
                                    const badgeColor = getExpirationBadgeColor(status);
                                    const badgeText = getExpirationBadgeText(value);
                                    
                                    return (
                                        <div key={field} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600 truncate flex-1">
                                                {DOCUMENTATION_LABELS[field]}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {value && (
                                                    <span className="text-gray-500">
                                                        {formatDate(value)}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${badgeColor}`}>
                                                    {badgeText}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {!semirremolque.tipo_servicio && (
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-amber-600">
                            <FaExclamationTriangle className="text-sm" />
                            <p className="text-xs">Sin tipo de servicio asignado</p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}