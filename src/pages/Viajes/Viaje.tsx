import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useViajesStore } from "@/stores/viajesStore";
import { useChoferesStore } from "@/stores/choferesStore";
import { useTractoresStore } from "@/stores/tractoresStore";
import { useSemirremolquesStore } from "@/stores/semirremolquesStore";
import { useServiciosStore } from "@/stores/serviciosStore";
import type { Viaje as ViajeType } from "@/services/viajesService";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import { FaArrowLeft, FaMapMarkerAlt, FaTruck, FaRoute, FaRuler, FaClipboardList, FaTrash, FaSave } from "react-icons/fa";

export default function Viaje() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedViaje, 
    isLoading: isLoadingViaje, 
    error: viajeError, 
    fetchViajeById, 
    addViaje, 
    editViaje, 
    removeViaje,
    clearSelectedViaje 
  } = useViajesStore();

  const { choferes, fetchChoferes } = useChoferesStore();
  const { tractores, fetchTractores } = useTractoresStore();
  const { semirremolques, fetchSemirremolques } = useSemirremolquesStore();
  const { servicios, fetchServicios } = useServiciosStore();

  const isEditing = id !== 'new';

  useEffect(() => {
    // Cargar datos necesarios
    fetchChoferes();
    fetchTractores();
    fetchSemirremolques();
    fetchServicios();

    if (isEditing && id) {
      fetchViajeById(id);
    }
    return () => clearSelectedViaje();
  }, [id, isEditing, fetchViajeById, clearSelectedViaje, fetchChoferes, fetchTractores, fetchSemirremolques, fetchServicios]);

  interface ViajeForm extends Omit<ViajeType, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> {
    fecha_salida: string;
    fecha_llegada: string;
  }

  const [formData, setFormData] = useState<ViajeForm>({
    chofer_id: "",
    tractor_id: "",
    semirremolque_id: "",
    tipo_servicio: "",
    fecha_salida: "",
    fecha_llegada: "",
    origen: "",
    destino: "",
    kilometros_recorridos: null,
    alcance_servicio: "Nacional",
    estado_viaje: "Programado",
    observaciones: "",
    duracion_horas: 0
  });

  useEffect(() => {
    if (selectedViaje) {
      // Formatear fechas para inputs de tipo datetime-local
      const formatearFechaParaInput = (fechaStr: string | null) => {
        if (!fechaStr) return "";
        const fecha = new Date(fechaStr);
        return fecha.toISOString().slice(0, 16); // Formato YYYY-MM-DDThh:mm
      };

      setFormData({
        chofer_id: selectedViaje.chofer_id,
        tractor_id: selectedViaje.tractor_id,
        semirremolque_id: selectedViaje.semirremolque_id,
        tipo_servicio: selectedViaje.tipo_servicio,
        fecha_salida: formatearFechaParaInput(selectedViaje.fecha_salida),
        fecha_llegada: formatearFechaParaInput(selectedViaje.fecha_llegada),
        origen: selectedViaje.origen,
        destino: selectedViaje.destino,
        kilometros_recorridos: selectedViaje.kilometros_recorridos,
        alcance_servicio: selectedViaje.alcance_servicio,
        estado_viaje: selectedViaje.estado_viaje,
        observaciones: selectedViaje.observaciones || "",
        duracion_horas: selectedViaje.duracion_horas
      });
    }
  }, [selectedViaje]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Para campos numéricos
    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const [error, setError] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await removeViaje(id);
      toast.success("Viaje eliminado correctamente");
      setShowDeleteModal(false);
      navigate("/viajes");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el viaje");
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditing && id) {
        await editViaje(id, formData);
        toast.success("Viaje actualizado correctamente");
        navigate("/viajes");
      } else {
        await addViaje(formData);
        toast.success("Viaje creado correctamente");
        navigate("/viajes");
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
    }
  };

  // Filtrar choferes activos
  const choferesActivos = choferes.filter(chofer => chofer.activo);
  // Filtrar tractores con estado activo
  const tractoresActivos = tractores.filter(tractor => tractor.estado === 'Disponible');
  // Filtrar semirremolques con estado activo
  const semirremolquesActivos = semirremolques.filter(semirremolque => semirremolque.estado === 'Disponible');

  console.log(tractores);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link to="/viajes" className="flex items-center text-primary hover:text-blue-700 transition-colors mr-4">
            <FaArrowLeft className="mr-2" />
            <span>Volver a viajes</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex-1">
            {isEditing ? "Editar viaje" : "Crear nuevo viaje"}
          </h1>
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-200"
            >
              <FaTrash className="mr-2" />
              Eliminar
            </button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">

        {(error || viajeError) && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error || viajeError}</span>
            </div>
          </div>
        )}

        {isLoadingViaje ? (
          <div className="flex justify-center items-center py-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-3"></div>
              <p className="text-gray-500 font-medium">Cargando datos del viaje...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FaTruck className="mr-2 text-primary" />
                Información del vehículo y conductor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chofer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chofer *
                </label>
                <select
                  name="chofer_id"
                  value={formData.chofer_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar chofer</option>
                  {choferesActivos.map(chofer => (
                    <option key={chofer.id} value={chofer.id}>
                      {chofer.nombre} {chofer.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tractor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tractor *
                </label>
                <select
                  name="tractor_id"
                  value={formData.tractor_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar tractor</option>
                  {tractoresActivos.map(tractor => (
                    <option key={tractor.id} value={tractor.id}>
                      {tractor.marca} {tractor.modelo} - {tractor.dominio}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semirremolque */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semirremolque *
                </label>
                <select
                  name="semirremolque_id"
                  value={formData.semirremolque_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar semirremolque</option>
                  {semirremolquesActivos.map(semirremolque => (
                    <option key={semirremolque.id} value={semirremolque.id}>
                      {semirremolque.nombre} - {semirremolque.dominio}
                    </option>
                  ))}
                </select>
              </div>

              </div>
            </div>

            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FaRoute className="mr-2 text-green-600" />
                Información del servicio y ruta
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de servicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de servicio *
                  </label>
                  <select
                    name="tipo_servicio"
                    value={formData.tipo_servicio}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar tipo de servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.id} value={servicio.nombre}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </select>
                </div>

              {/* Fecha de salida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora de salida *
                </label>
                <input
                  type="datetime-local"
                  name="fecha_salida"
                  value={formData.fecha_salida}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Fecha de llegada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora de llegada
                </label>
                <input
                  type="datetime-local"
                  name="fecha_llegada"
                  value={formData.fecha_llegada}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={formData.fecha_salida} // No permitir fechas anteriores a la salida
                />
              </div>

              {/* Origen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  name="origen"
                  value={formData.origen}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  name="destino"
                  value={formData.destino}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              </div>
            </div>
            
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-yellow-600" />
                Origen, destino y distancia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kilómetros recorridos */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaRuler className="mr-1 text-gray-500" />
                    Kilómetros recorridos
                  </label>
                  <input
                    type="number"
                    name="kilometros_recorridos"
                    value={formData.kilometros_recorridos === null ? '' : formData.kilometros_recorridos}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Alcance del servicio */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaRoute className="mr-1 text-gray-500" />
                    Alcance del servicio *
                  </label>
                  <select
                    name="alcance_servicio"
                    value={formData.alcance_servicio}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Nacional">Nacional</option>
                    <option value="Internacional">Internacional</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FaClipboardList className="mr-2 text-purple-600" />
                Estado y observaciones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Estado del viaje */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Estado del viaje *
                  </label>
                  <select
                    name="estado_viaje"
                    value={formData.estado_viaje}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Programado">Programado</option>
                    <option value="En curso">En curso</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Observaciones */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ingrese cualquier información adicional relevante para este viaje..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/viajes")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                disabled={isLoadingViaje}
              >
                <FaSave className="mr-2" />
                {isEditing ? "Actualizar viaje" : "Guardar viaje"}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmar eliminación"
        message="¿Está seguro que desea eliminar este viaje? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}