import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useParadasStore } from "@/stores/paradasStore";
import { useViajesStore } from "@/stores/viajesStore";
import { useAuth } from "@/stores/authStore";
import { toast } from "react-toastify";
import { 
  FaArrowLeft, 
  FaPlus, 
  FaMapMarkerAlt, 
  FaTachometerAlt, 
  FaFlag, 
  FaCoffee, 
  FaBox, 
  FaEllipsisH,
  FaCheckCircle
} from "react-icons/fa";
import type { TipoParada, CreateParadaDTO } from "@/types/parada";
import type { Destino } from "@/types/destino";

export default function ParadasView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    paradas, 
    isLoading, 
    error, 
    fetchParadasByViaje, 
    addParada, 
    finalizarViaje: finalizarViajeStore,
    clearError 
  } = useParadasStore();
  
  const { selectedViaje, fetchViajeById } = useViajesStore();
  
  const [showModal, setShowModal] = useState(false);
  const [odometro, setOdometro] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tipoParada, setTipoParada] = useState<TipoParada>("descanso");
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<number | null>(null);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  const isChofer = user?.role === 'chofer';

  useEffect(() => {
    if (id) {
      fetchViajeById(Number(id));
      fetchParadasByViaje(id);
    }
  }, [id, fetchViajeById, fetchParadasByViaje]);

  useEffect(() => {
    if (selectedViaje && (selectedViaje as any).destinos) {
      setDestinos((selectedViaje as any).destinos);
    }
  }, [selectedViaje]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const getIconoTipo = (tipo: TipoParada) => {
    switch (tipo) {
      case 'inicio':
        return <FaFlag className="text-green-600" />;
      case 'descanso':
        return <FaCoffee className="text-yellow-600" />;
      case 'carga':
        return <FaBox className="text-blue-600" />;
      case 'llegada':
        return <FaCheckCircle className="text-purple-600" />;
      case 'otro':
        return <FaEllipsisH className="text-gray-600" />;
      default:
        return <FaMapMarkerAlt className="text-gray-600" />;
    }
  };

  const getTipoLabel = (tipo: TipoParada) => {
    const labels = {
      inicio: 'Inicio',
      descanso: 'Descanso',
      carga: 'Carga',
      otro: 'Otro',
      llegada: 'Llegada'
    };
    return labels[tipo];
  };

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const year = fecha.getFullYear();
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleIniciarViaje = async () => {
    if (!odometro) {
      toast.error("Por favor ingrese el odómetro");
      return;
    }

    if (!id || !selectedViaje) return;

    setIsInitializing(true);
    try {
      const nuevaParada: CreateParadaDTO = {
        viaje_id: Number(id),
        odometro: Number(odometro),
        ubicacion: selectedViaje.origen, // Usar el origen del viaje como ubicación inicial
        tipo: 'inicio'
      };

      await addParada(nuevaParada);
      toast.success("Viaje iniciado exitosamente");
      setOdometro("");
      // Recargar el viaje para actualizar el estado
      await fetchViajeById(Number(id));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Error al iniciar viaje");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAgregarParada = async () => {
    if (!odometro || !tipoParada) {
      toast.error("Por favor complete el odómetro");
      return;
    }

    if (tipoParada === 'llegada' && !destinoSeleccionado) {
      toast.error("Por favor seleccione un destino");
      return;
    }

    // Para paradas que no son de llegada, validar que se ingrese ubicación
    if (tipoParada !== 'llegada' && !ubicacion) {
      toast.error("Por favor ingrese la ubicación");
      return;
    }

    if (!id) return;

    try {
      // Determinar la ubicación según el tipo de parada
      let ubicacionFinal = ubicacion;
      if (tipoParada === 'llegada' && destinoSeleccionado) {
        const destinoEncontrado = destinos.find(d => d.id === destinoSeleccionado);
        ubicacionFinal = destinoEncontrado?.ubicacion || ubicacion;
      }

      const nuevaParada: CreateParadaDTO = {
        viaje_id: Number(id),
        odometro: Number(odometro),
        ubicacion: ubicacionFinal,
        tipo: tipoParada,
        destino_id: tipoParada === 'llegada' ? destinoSeleccionado : null
      };

      await addParada(nuevaParada);
      toast.success("Parada agregada exitosamente");
      setShowModal(false);
      setOdometro("");
      setUbicacion("");
      setTipoParada("descanso");
      setDestinoSeleccionado(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Error al agregar parada");
    }
  };

  const handleFinalizarViaje = async () => {
    if (!id) return;

    try {
      await finalizarViajeStore(id);
      toast.success("Viaje finalizado exitosamente");
      // Recargar el viaje para actualizar el estado
      await fetchViajeById(Number(id));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Error al finalizar viaje");
    }
  };

  const paradasLlegada = paradas.filter(p => p.tipo === 'llegada').length;
  const cantidadDestinos = selectedViaje?.cantidad_destinos || 0;
  const puedeFinalizar = paradasLlegada === cantidadDestinos && paradasLlegada > 0;

  if (isLoading && !selectedViaje) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedViaje) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>Viaje no encontrado</p>
        </div>
      </div>
    );
  }

  // Vista para viaje programado (solo chofer)
  if (selectedViaje.estado === 'programado' && isChofer) {
    return (
      <div className="mx-auto p-4 max-w-2xl">
        <button
          onClick={() => navigate('/viajes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FaArrowLeft /> Volver a viajes
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Iniciar Viaje</h1>
          
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">Información del Viaje</h2>
            <p><strong>Ubicación de salida:</strong> {selectedViaje.origen}</p>
            <p><strong>Destinos:</strong> {selectedViaje.cantidad_destinos}</p>
            <p><strong>Fecha de salida:</strong> {formatearFecha(selectedViaje.fecha_hora_salida)}</p>
            <p className="text-sm text-gray-600 mt-2">La ubicación de inicio se registrará automáticamente como: <span className="font-semibold">{selectedViaje.origen}</span></p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaTachometerAlt className="inline mr-2" />
                Odómetro Inicial (km) *
              </label>
              <input
                type="number"
                value={odometro}
                onChange={(e) => setOdometro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingrese el odómetro inicial"
                step="0.01"
              />
            </div>

            <button
              onClick={handleIniciarViaje}
              disabled={isInitializing || !odometro}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {isInitializing ? "Iniciando..." : "Iniciar Viaje"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista para viaje en curso o finalizado
  return (
    <div className="mx-auto p-4 max-w-4xl">
      <button
        onClick={() => navigate('/viajes')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <FaArrowLeft /> Volver a viajes
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedViaje.estado === 'en curso' ? 'Viaje en Curso' : 'Viaje Finalizado'}
          </h1>
          <p className="text-gray-600 mt-2">
            <strong>Origen:</strong> {selectedViaje.origen}
          </p>
          <p className="text-gray-600">
            <strong>Destinos:</strong> {selectedViaje.cantidad_destinos} | 
            <strong> Llegadas registradas:</strong> {paradasLlegada}
          </p>
        </div>

        {isChofer && selectedViaje.estado === 'en curso' && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus /> Agregar Parada
            </button>
            
            <button
              onClick={handleFinalizarViaje}
              disabled={!puedeFinalizar}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              title={!puedeFinalizar ? `Debe registrar ${cantidadDestinos} llegadas para finalizar` : ''}
            >
              <FaCheckCircle /> Finalizar Viaje
            </button>
          </div>
        )}
      </div>

      {/* Lista de paradas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Paradas Registradas</h2>
        
        {paradas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay paradas registradas</p>
        ) : (
          <div className="space-y-4">
            {paradas.map((parada, index) => (
              <div 
                key={parada.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-2xl">
                    {getIconoTipo(parada.tipo)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">
                        Parada #{index + 1} - {getTipoLabel(parada.tipo)}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatearFecha(parada.fecha_hora)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>
                        <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                        <strong>Ubicación:</strong> {parada.ubicacion}
                      </p>
                      <p>
                        <FaTachometerAlt className="inline mr-2 text-gray-400" />
                        <strong>Odómetro:</strong> {parada.odometro} km
                      </p>
                      {parada.destino_id && (
                        <p className="col-span-2">
                          <strong>Destino:</strong> {destinos.find(d => d.id === parada.destino_id)?.ubicacion || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para agregar parada */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Agregar Parada</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Parada
                </label>
                <select
                  value={tipoParada}
                  onChange={(e) => setTipoParada(e.target.value as TipoParada)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="descanso">Descanso</option>
                  <option value="carga">Carga</option>
                  <option value="otro">Otro</option>
                  <option value="llegada">Llegada</option>
                </select>
              </div>

              {tipoParada === 'llegada' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino *
                  </label>
                  <select
                    value={destinoSeleccionado || ''}
                    onChange={(e) => {
                      const destinoId = Number(e.target.value);
                      setDestinoSeleccionado(destinoId);
                      // Auto-completar la ubicación con el destino seleccionado
                      const destinoEncontrado = destinos.find(d => d.id === destinoId);
                      if (destinoEncontrado) {
                        setUbicacion(destinoEncontrado.ubicacion);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Seleccione un destino</option>
                    {destinos.map((destino) => (
                      <option key={destino.id} value={destino.id}>
                        {destino.ubicacion} (Orden: {destino.orden})
                      </option>
                    ))}
                  </select>
                  {destinoSeleccionado && (
                    <p className="text-sm text-gray-600 mt-1">
                      Ubicación: <span className="font-semibold">{destinos.find(d => d.id === destinoSeleccionado)?.ubicacion}</span>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Odómetro (km) *
                </label>
                <input
                  type="number"
                  value={odometro}
                  onChange={(e) => setOdometro(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ingrese el odómetro"
                  step="0.01"
                />
              </div>

              {tipoParada !== 'llegada' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ingrese la ubicación"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAgregarParada}
                  disabled={isLoading}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {isLoading ? "Agregando..." : "Agregar"}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setOdometro("");
                    setUbicacion("");
                    setTipoParada("descanso");
                    setDestinoSeleccionado(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
