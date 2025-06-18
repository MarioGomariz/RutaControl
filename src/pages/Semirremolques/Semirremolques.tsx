
import { useEffect, useState } from "react";
import { useSemirremolquesStore } from "@/stores/semirremolquesStore";
import { FaTruckMoving, FaSearch, FaPlus, FaIdCard, FaWeightHanging, FaCalendar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Semirremolque } from "@/utils/supabase";

export default function Semirremolques() {
    const { semirremolques, isLoading, error, fetchSemirremolques } = useSemirremolquesStore();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Load semirremolques data when component mounts
        fetchSemirremolques();
    }, [fetchSemirremolques]);

    // Filtrar semirremolques según el término de búsqueda
    const filteredSemirremolques = semirremolques.filter(semirremolque => 
        semirremolque.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        semirremolque.dominio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        semirremolque.tipo_servicio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(semirremolque.año || '').includes(searchTerm)
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 flex flex-col text-gray-800">
            <div className="flex items-center gap-3 mb-2">
                <FaTruckMoving className="text-green-600 text-2xl" />
                <h1 className="text-3xl font-bold text-gray-800">Semirremolques</h1>
            </div>
            <p className="text-gray-600 mb-6 pl-9">Gestión de flota de semirremolques</p>
            
            {/* Barra de búsqueda y botón de agregar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
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
                <Link 
                    to="/semirremolque/new"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors w-full sm:w-auto justify-center"
                >
                    <FaPlus /> Agregar semirremolque
                </Link>
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
    // Determinar si el semirremolque está activo basado en su estado
    const isActive = semirremolque.estado === "Activo";
    
    // Calcular si el RTO está próximo a vencer (30 días) si existe
    const rtoDate = semirremolque.vencimiento_rto ? new Date(semirremolque.vencimiento_rto) : null;
    const today = new Date();
    const daysUntilRto = rtoDate ? Math.ceil((rtoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isRtoExpiringSoon = daysUntilRto !== null && daysUntilRto <= 30 && daysUntilRto >= 0;
    const isRtoExpired = daysUntilRto !== null && daysUntilRto < 0;
    
    return (
        <Link to={`/semirremolque/${semirremolque.id}`} className="block">
            <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 hover:shadow-lg transition-shadow ${!isActive ? 'border-gray-400' : isRtoExpired ? 'border-red-500' : isRtoExpiringSoon ? 'border-amber-500' : 'border-green-500'}`}>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800 truncate">
                            {semirremolque.nombre || 'Sin nombre'}
                        </h3>
                        {!isActive && (
                            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                                Inactivo
                            </span>
                        )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                            <FaIdCard className="mr-2 text-gray-500" />
                            <span>{semirremolque.dominio || 'Sin dominio'}</span>
                        </div>
                        
                        {semirremolque.año && (
                            <div className="flex items-center text-gray-600">
                                <FaCalendar className="mr-2 text-gray-500" />
                                <span>Año: {semirremolque.año}</span>
                            </div>
                        )}
                        
                        {semirremolque.tipo_servicio && (
                            <div className="flex items-center text-gray-600">
                                <FaWeightHanging className="mr-2 text-gray-500" />
                                <span>{semirremolque.tipo_servicio}</span>
                            </div>
                        )}
                    </div>
                    
                    {rtoDate && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">RTO</p>
                                    <p className="font-medium">{new Date(semirremolque.vencimiento_rto).toLocaleDateString()}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isRtoExpired ? 'bg-red-100 text-red-800' : isRtoExpiringSoon ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    {isRtoExpired ? 'Vencida' : isRtoExpiringSoon ? `${daysUntilRto} días` : 'Vigente'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}