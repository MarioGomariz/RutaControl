import { useEffect, useState } from "react";
import { useChoferesStore } from "@/stores/choferesStore";
import { FaUserTie, FaSearch, FaPlus, FaIdCard, FaPhone, FaEnvelope, FaExclamationTriangle, FaClock, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import type { Chofer } from "@/types/chofer";
import { getDaysUntilExpiration } from "@/utils/semirremolqueDocumentation";
import { formatDni, formatTelefono, formatEmail, formatNombrePropio } from "@/utils/inputNormalizers";
import { useAuth } from "@/stores/authStore";
import { hasPermission } from "@/utils/permissions";

type FiltroVencimiento = 'todos' | 'vencidos' | 'proximos';

export default function Choferes() {
    const { choferes, isLoading, error, fetchChoferes } = useChoferesStore();
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
    const canCreate = hasPermission(rolId, 'create_choferes');

    useEffect(() => {
        fetchChoferes();
    }, [fetchChoferes]);

    const filteredChoferes = choferes.filter(chofer => {
        // Filtro de búsqueda
        const matchesSearch = chofer && (
            chofer.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chofer.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chofer.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chofer.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!matchesSearch) return false;

        // Filtro de vencimiento
        if (filtroVencimiento === 'todos') return true;

        if (chofer.fecha_vencimiento_licencia) {
            const days = getDaysUntilExpiration(chofer.fecha_vencimiento_licencia);
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
        <div className="w-full max-w-7xl mx-auto p-4 flex flex-col text-gray-800">
            <div className="flex items-center gap-3 mb-2">
                <FaUserTie className="text-blue-600 text-2xl" />
                <h1 className="text-3xl font-bold text-gray-800">Choferes</h1>
            </div>
            <p className="text-gray-600 mb-6 pl-9">Gestión de choferes y licencias</p>
            
            {/* Barra de búsqueda y botón de agregar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative w-full sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, DNI o email..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {canCreate && (
                    <Link 
                        to="/chofer/new"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors w-full sm:w-auto justify-center"
                    >
                        <FaPlus /> Agregar chofer
                    </Link>
                )}
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
                <div className="flex justify-center items-center h-64 w-full">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-500 font-medium">Cargando choferes...</p>
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
                    {filteredChoferes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 w-full">
                            <FaUserTie className="text-gray-300 text-5xl mb-4" />
                            <p className="text-gray-500 text-xl font-medium">
                                {searchTerm ? "No se encontraron choferes que coincidan con la búsqueda" : "No hay choferes registrados"}
                            </p>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm("")}
                                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredChoferes.map((chofer) => (
                                <ChoferCard key={chofer.id} chofer={chofer} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Componente de tarjeta de chofer mejorado
function ChoferCard({ chofer }: { chofer: Chofer }) {
    // Calcular si la licencia está próxima a vencer (30 días)
    const licenciaDate = chofer.fecha_vencimiento_licencia ? new Date(chofer.fecha_vencimiento_licencia) : null;
    const today = new Date();
    const daysUntilExpiration = licenciaDate ? Math.ceil((licenciaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0;
    const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;
    
    return (
        <Link to={`/chofer/${chofer.id}`} className="block">
            <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 hover:shadow-lg transition-shadow ${!chofer.activo ? 'border-gray-400' : isExpired ? 'border-red-500' : isExpiringSoon ? 'border-amber-500' : 'border-green-500'}`}>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800 truncate">
                            {formatNombrePropio(chofer.nombre)} {formatNombrePropio(chofer.apellido)}
                        </h3>
                        {!chofer.activo && (
                            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                                Inactivo
                            </span>
                        )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                            <FaIdCard className="mr-2 text-gray-500" />
                            <span>{chofer.dni ? formatDni(chofer.dni) : 'Sin DNI'}</span>
                        </div>
                        
                        {chofer.telefono && (
                            <div className="flex items-center text-gray-600">
                                <FaPhone className="mr-2 text-gray-500" />
                                <span>{formatTelefono(chofer.telefono)}</span>
                            </div>
                        )}
                        
                        {chofer.email && (
                            <div className="flex items-center text-gray-600 truncate">
                                <FaEnvelope className="mr-2 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{formatEmail(chofer.email)}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Licencia</p>
                                <p className="font-medium truncate">{chofer.licencia}</p>
                            </div>
                            {licenciaDate && (
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-800' : isExpiringSoon ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    {isExpired ? 'Vencido' : daysUntilExpiration === 0 ? 'Vence hoy' : daysUntilExpiration === 1 ? 'Vence mañana' : isExpiringSoon ? `${daysUntilExpiration} días` : 'Vigente'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}