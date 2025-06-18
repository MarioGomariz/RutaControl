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
import { FaArrowLeft, FaTruck, FaRoute, FaClipboardList, FaTrash, FaSave, FaMapMarked } from "react-icons/fa";
import { 
  FormSection, 
  FormField, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormButton 
} from "@/components/FormComponents";

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
  
  // Función específica para campos numéricos
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : Number(value)
    }));
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
            <FormSection 
              title="Información del vehículo y conductor" 
              icon={<FaTruck />} 
              color="blue"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chofer */}
                <FormField label="Chofer" name="chofer_id" required>
                  <FormSelect
                    name="chofer_id"
                    value={formData.chofer_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar chofer</option>
                    {choferesActivos.map(chofer => (
                      <option key={chofer.id} value={chofer.id}>
                        {chofer.nombre} {chofer.apellido}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                {/* Tractor */}
                <FormField label="Tractor" name="tractor_id" required>
                  <FormSelect
                    name="tractor_id"
                    value={formData.tractor_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar tractor</option>
                    {tractoresActivos.map(tractor => (
                      <option key={tractor.id} value={tractor.id}>
                        {tractor.marca} {tractor.modelo} - {tractor.dominio}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                {/* Semirremolque */}
                <FormField label="Semirremolque" name="semirremolque_id" required>
                  <FormSelect
                    name="semirremolque_id"
                    value={formData.semirremolque_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar semirremolque</option>
                    {semirremolquesActivos.map(semirremolque => (
                      <option key={semirremolque.id} value={semirremolque.id}>
                        {semirremolque.nombre} - {semirremolque.dominio}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

              </div>
            </FormSection>

            <FormSection
              title="Información del servicio y ruta" 
              icon={<FaRoute />} 
              color="green"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de servicio */}
                <FormField label="Tipo de servicio" name="tipo_servicio" required>
                  <FormSelect
                    name="tipo_servicio"
                    value={formData.tipo_servicio}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar tipo de servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.id} value={servicio.nombre}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                {/* Alcance del servicio */}
                <FormField label="Alcance del servicio" name="alcance_servicio" required>
                  <FormSelect
                    name="alcance_servicio"
                    value={formData.alcance_servicio}
                    onChange={handleChange}
                    required
                  >
                    <option value="Nacional">Nacional</option>
                    <option value="Internacional">Internacional</option>
                  </FormSelect>
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Origen, destino y fechas"
              icon={<FaMapMarked />}
              color="amber"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Origen */}
                <FormField label="Origen" name="origen" required>
                  <FormInput
                    type="text"
                    name="origen"
                    value={formData.origen}
                    onChange={handleChange}
                    placeholder="Ciudad o lugar de origen"
                    required
                  />
                </FormField>

                {/* Destino */}
                <FormField label="Destino" name="destino" required>
                  <FormInput
                    type="text"
                    name="destino"
                    value={formData.destino}
                    onChange={handleChange}
                    placeholder="Ciudad o lugar de destino"
                    required
                  />
                </FormField>

                {/* Fecha de salida */}
                <FormField label="Fecha y hora de salida" name="fecha_salida" required>
                  <FormInput
                    type="datetime-local"
                    name="fecha_salida"
                    value={formData.fecha_salida}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                {/* Fecha de llegada */}
                <FormField label="Fecha y hora de llegada" name="fecha_llegada">
                  <FormInput
                    type="datetime-local"
                    name="fecha_llegada"
                    value={formData.fecha_llegada || ''}
                    onChange={handleChange}
                    min={formData.fecha_salida} // No permitir fechas anteriores a la salida
                  />
                </FormField>

                {/* Kilómetros recorridos */}
                <FormField label="Kilómetros recorridos" name="kilometros_recorridos">
                  <FormInput
                    type="number"
                    name="kilometros_recorridos"
                    value={formData.kilometros_recorridos || ''}
                    onChange={handleNumericChange}
                    min="0"
                    step="1"
                    placeholder="Distancia total en km"
                  />
                </FormField>
                
                {/* Duración en horas */}
                <FormField label="Duración estimada (horas)" name="duracion_horas">
                  <FormInput
                    type="number"
                    name="duracion_horas"
                    value={formData.duracion_horas || ''}
                    onChange={handleNumericChange}
                    min="0"
                    step="0.5"
                    placeholder="Tiempo estimado de viaje"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Estado y observaciones"
              icon={<FaClipboardList />}
              color="purple"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Estado del viaje */}
                <FormField label="Estado del viaje" name="estado_viaje" required>
                  <FormSelect
                    name="estado_viaje"
                    value={formData.estado_viaje}
                    onChange={handleChange}
                    required
                  >
                    <option value="Programado">Programado</option>
                    <option value="En curso">En curso</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </FormSelect>
                </FormField>
              </div>

              {/* Observaciones */}
              <div className="col-span-1 md:col-span-2">
                <FormField label="Observaciones" name="observaciones">
                  <FormTextarea
                    name="observaciones"
                    value={formData.observaciones || ''}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Ingrese cualquier información adicional relevante para este viaje..."
                  />
                </FormField>
              </div>
            </FormSection>
            
            <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
              <FormButton
                type="button"
                onClick={() => navigate("/viajes")}
                variant="secondary"
              >
                Cancelar
              </FormButton>
              {isEditing && (
                <FormButton
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  icon={<FaTrash />}
                >
                  Eliminar
                </FormButton>
              )}
              <FormButton
                type="submit"
                variant="primary"
                icon={<FaSave />}
              >
                {isEditing ? 'Guardar cambios' : 'Crear viaje'}
              </FormButton>
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