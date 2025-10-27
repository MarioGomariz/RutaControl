import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useViajesStore } from "@/stores/viajesStore";
import { useChoferesStore } from "@/stores/choferesStore";
import { useTractoresStore } from "@/stores/tractoresStore";
import { useSemirremolquesStore } from "@/stores/semirremolquesStore";
import { useServiciosStore } from "@/stores/serviciosStore";
import type { Viaje as ViajeType, EstadoViaje } from "@/types/viaje";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import { FaArrowLeft, FaTruck, FaRoute, FaClipboardList, FaTrash, FaSave, FaMapMarked, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { 
  FormSection, 
  FormField, 
  FormInput, 
  FormSelect, 
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
  const parsedId = isEditing && id ? Number(id) : null;

  useEffect(() => {
    // Cargar datos necesarios
    fetchChoferes();
    fetchTractores();
    fetchSemirremolques();
    fetchServicios();

    if (isEditing && parsedId !== null && !Number.isNaN(parsedId)) {
      fetchViajeById(parsedId);
    }
    return () => clearSelectedViaje();
  }, [parsedId, isEditing, fetchViajeById, clearSelectedViaje, fetchChoferes, fetchTractores, fetchSemirremolques, fetchServicios]);

  interface ViajeForm extends Omit<ViajeType, 'id'> {}
  
  interface DestinoForm {
    orden: number;
    ubicacion: string;
  }

  const [formData, setFormData] = useState<ViajeForm>({
    chofer_id: 0,
    tractor_id: 0,
    semirremolque_id: 0,
    servicio_id: 0,
    alcance: 'nacional',
    origen: "",
    cantidad_destinos: 1,
    fecha_hora_salida: "",
    estado: "programado" as EstadoViaje,
  });
  
  const [destinos, setDestinos] = useState<DestinoForm[]>([
    { orden: 1, ubicacion: "" }
  ]);

  useEffect(() => {
    if (selectedViaje) {
      setFormData({
        chofer_id: selectedViaje.chofer_id,
        tractor_id: selectedViaje.tractor_id,
        semirremolque_id: selectedViaje.semirremolque_id,
        servicio_id: selectedViaje.servicio_id,
        alcance: selectedViaje.alcance,
        origen: selectedViaje.origen,
        cantidad_destinos: selectedViaje.cantidad_destinos,
        fecha_hora_salida: selectedViaje.fecha_hora_salida ? new Date(selectedViaje.fecha_hora_salida).toISOString().slice(0, 10) : "",
        estado: selectedViaje.estado,
      });
      
      // Cargar destinos si existen
      if ((selectedViaje as any).destinos && Array.isArray((selectedViaje as any).destinos)) {
        const destinosCargados = (selectedViaje as any).destinos.map((d: any) => ({
          orden: d.orden,
          ubicacion: d.ubicacion
        }));
        setDestinos(destinosCargados.length > 0 ? destinosCargados : [{ orden: 1, ubicacion: "" }]);
      }
    }
  }, [selectedViaje]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const numericFields = new Set([
      'chofer_id',
      'tractor_id',
      'semirremolque_id',
      'servicio_id',
      'cantidad_destinos',
    ]);
    // Para campos numéricos
    if (type === "number" || numericFields.has(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value)
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
      [name]: value === "" ? 0 : Number(value)
    }));
  };

  const [error, setError] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Funciones para manejar destinos
  const agregarDestino = () => {
    setDestinos([...destinos, { orden: destinos.length + 1, ubicacion: "" }]);
  };
  
  const eliminarDestino = (index: number) => {
    if (destinos.length > 1) {
      const nuevosDestinos = destinos.filter((_, i) => i !== index);
      // Reordenar
      const reordenados = nuevosDestinos.map((d, i) => ({ ...d, orden: i + 1 }));
      setDestinos(reordenados);
    }
  };
  
  const actualizarDestino = (index: number, ubicacion: string) => {
    const nuevosDestinos = [...destinos];
    nuevosDestinos[index].ubicacion = ubicacion;
    setDestinos(nuevosDestinos);
  };

  const handleDelete = async () => {
    if (parsedId === null) return;
    
    try {
      await removeViaje(parsedId);
      toast.success("Viaje eliminado correctamente");
      setShowDeleteModal(false);
      navigate("/viajes");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el viaje");
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validaciones básicas
      if (!formData.origen.trim()) {
        toast.error('El origen es obligatorio');
        return;
      }
      if (!formData.fecha_hora_salida) {
        toast.error('La fecha de salida es obligatoria');
        return;
      }
      if (!formData.chofer_id || formData.chofer_id <= 0) {
        toast.error('Debes seleccionar un chofer');
        return;
      }
      if (!formData.tractor_id || formData.tractor_id <= 0) {
        toast.error('Debes seleccionar un tractor');
        return;
      }
      if (!formData.semirremolque_id || formData.semirremolque_id <= 0) {
        toast.error('Debes seleccionar un semirremolque');
        return;
      }
      if (!formData.servicio_id || formData.servicio_id <= 0) {
        toast.error('Debes seleccionar un servicio');
        return;
      }
      
      // Validar destinos
      if (destinos.length === 0) {
        toast.error('Debe haber al menos un destino');
        return;
      }
      
      const destinosVacios = destinos.filter(d => !d.ubicacion.trim());
      if (destinosVacios.length > 0) {
        toast.error('Todos los destinos deben tener una ubicación');
        return;
      }

      // Preparar datos con destinos
      const viajeData = {
        ...formData,
        cantidad_destinos: destinos.length,
        destinos: destinos.map(d => ({ orden: d.orden, ubicacion: d.ubicacion }))
      };

      if (isEditing && parsedId !== null) {
        await editViaje(parsedId, viajeData as any);
        toast.success("Viaje actualizado correctamente");
        navigate("/viajes");
      } else {
        await addViaje(viajeData as any);
        toast.success("Viaje creado correctamente");
        navigate("/viajes");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al guardar el viaje');
      toast.error('No se pudo guardar el viaje');
    }
  };

  // Filtrar choferes activos
  const choferesActivos = choferes.filter(chofer => chofer.activo);
  // Filtrar tractores con estado activo
  const tractoresActivos = tractores.filter(tractor => tractor.estado === 'disponible');
  // Filtrar semirremolques con estado activo
  const semirremolquesActivos = semirremolques.filter(semirremolque => semirremolque.estado === 'disponible');

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
                {/* Servicio */}
                <FormField label="Servicio" name="servicio_id" required>
                  <FormSelect
                    name="servicio_id"
                    value={formData.servicio_id}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>Seleccionar servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                {/* Alcance */}
                <FormField label="Alcance" name="alcance" required>
                  <FormSelect
                    name="alcance"
                    value={formData.alcance}
                    onChange={handleChange}
                    required
                  >
                    <option value="nacional">Nacional</option>
                    <option value="internacional">Internacional</option>
                  </FormSelect>
                </FormField>
              </div>
            </FormSection>
            
            <FormSection
              title="Destinos del viaje"
              icon={<FaMapMarkerAlt />}
              color="indigo"
            >
              <div className="space-y-4">
                {destinos.map((destino, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destino {index + 1}
                      </label>
                      <input
                        type="text"
                        value={destino.ubicacion}
                        onChange={(e) => actualizarDestino(index, e.target.value)}
                        placeholder="Ubicación del destino"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    {destinos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarDestino(index)}
                        className="mt-8 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
                        title="Eliminar destino"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={agregarDestino}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaPlus /> Agregar destino
                </button>
                
                <p className="text-sm text-gray-600 mt-2">
                  Total de destinos: <strong>{destinos.length}</strong>
                </p>
              </div>
            </FormSection>

            <FormSection
              title="Origen y fecha"
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

                {/* Fecha de salida */}
                <FormField label="Fecha de salida" name="fecha_hora_salida" required>
                  <FormInput
                    type="date"
                    name="fecha_hora_salida"
                    value={formData.fecha_hora_salida}
                    onChange={handleChange}
                    required
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Estado"
              icon={<FaClipboardList />}
              color="purple"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Estado del viaje */}
                <FormField label="Estado del viaje" name="estado" required>
                  <FormSelect
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                  >
                    <option value="programado">Programado</option>
                    <option value="en curso">En curso</option>
                    <option value="finalizado">Finalizado</option>
                  </FormSelect>
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