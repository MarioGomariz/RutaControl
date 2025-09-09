import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSemirremolquesStore } from "@/stores";
import { Semirremolque as SemirremolqueType } from "@/types";
import { useServiciosStore } from "@/stores/serviciosStore";
import { toast } from "react-toastify";
import ConfirmModal from '@/components/ConfirmModal';
import { FormSection, FormField, FormInput, FormSelect, FormButton } from '@/components/FormComponents';
import { FaTruck, FaCalendarAlt, FaGlobeAmericas } from 'react-icons/fa';

export default function Semirremolque() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    selectedSemirremolque: semirremolque, 
    fetchSemirremolqueById, 
    addSemirremolque, 
    editSemirremolque,
    removeSemirremolque,
    isLoading,
    error,
    clearError
  } = useSemirremolquesStore();
  
  const { servicios, fetchServicios } = useServiciosStore();
  
  useEffect(() => {
    if (id) {
      fetchSemirremolqueById(id);
    }
    
    // Cargar la lista de servicios disponibles
    fetchServicios();
  }, [id, fetchSemirremolqueById, fetchServicios]);

  // Actualizar el formulario cuando se carga un semirremolque existente
  useEffect(() => {
    if (semirremolque) {
      setFormData({
        nombre: semirremolque.nombre || "",
        dominio: semirremolque.dominio || "",
        anio: semirremolque.anio || new Date().getFullYear(),
        estado: semirremolque.estado || "disponible",
        tipo_servicio: semirremolque.tipo_servicio || "",
        alcance_servicio: semirremolque.alcance_servicio || "nacional",
        vencimiento_rto: semirremolque.vencimiento_rto || "",
        vencimiento_visual_externa: semirremolque.vencimiento_visual_externa || "",
        vencimiento_visual_interna: semirremolque.vencimiento_visual_interna || "",
        vencimiento_espesores: semirremolque.vencimiento_espesores || "",
        vencimiento_prueba_hidraulica: semirremolque.vencimiento_prueba_hidraulica || "",
        vencimiento_mangueras: semirremolque.vencimiento_mangueras || "",
        vencimiento_valvula_flujo: semirremolque.vencimiento_valvula_flujo || "",
      });
    }
  }, [semirremolque]);

  const [formData, setFormData] = useState<Partial<SemirremolqueType>>({
    nombre: "",
    dominio: "",
    anio: new Date().getFullYear(),
    estado: "disponible",
    tipo_servicio: "",
    alcance_servicio: "nacional",
    vencimiento_rto: "",
    vencimiento_visual_externa: "",
    vencimiento_visual_interna: "",
    vencimiento_espesores: "",
    vencimiento_prueba_hidraulica: "",
    vencimiento_mangueras: "",
    vencimiento_valvula_flujo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (semirremolque && id) {
        await editSemirremolque(id, formData);
        toast.success("Semirremolque actualizado correctamente");
      } else {
        await addSemirremolque(formData as Omit<SemirremolqueType, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>);
        toast.success("Semirremolque agregado correctamente");
      }
      navigate("/semirremolques");
    } catch (err) {
      console.error("Error al guardar el semirremolque:", err);
      toast.error("Error al guardar el semirremolque");
    }
  };
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await removeSemirremolque(id);
      toast.success('Semirremolque eliminado correctamente');
      setShowDeleteModal(false);
      navigate('/semirremolques');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el semirremolque');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              className="absolute top-0 right-0 px-4 py-3" 
              onClick={clearError}
            >
              <span className="text-red-500">&times;</span>
            </button>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {semirremolque ? "Editar semirremolque" : "Agregar semirremolque"}
            </h1>
            {semirremolque && id && (
              <FormButton
                type="button"
                onClick={() => setShowDeleteModal(true)}
                variant="danger"
              >
                Eliminar
              </FormButton>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => handleSubmit(e)}
          className="space-y-6"
        >
          <FormSection
            title="Información del semirremolque"
            icon={<FaTruck />}
            color="blue"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nombre/Tipo" name="nombre" required>
                <FormInput
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Cisterna para GLP"
                  required
                />
              </FormField>

              <FormField label="Dominio (Patente)" name="dominio" required>
                <FormInput
                  type="text"
                  name="dominio"
                  value={formData.dominio}
                  onChange={handleChange}
                  placeholder="Ej: AB123CD"
                  required
                />
              </FormField>

              <FormField label="Año" name="anio" required>
                <FormInput
                  type="number"
                  name="anio"
                  value={formData.anio}
                  onChange={handleChange}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </FormField>

              <FormField label="Estado" name="estado" required>
                <FormSelect
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="disponible">Disponible</option>
                  <option value="en uso">En uso</option>
                  <option value="en reparacion">En reparación</option>
                  <option value="fuera de servicio">Fuera de servicio</option>
                </FormSelect>
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Servicio y alcance"
            icon={<FaGlobeAmericas />}
            color="amber"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Tipo de Servicio" name="tipo_servicio" required>
                <FormSelect
                  name="tipo_servicio"
                  value={formData.tipo_servicio}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un servicio</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.nombre}>
                      {servicio.nombre}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Alcance del Servicio" name="alcance_servicio" required>
                <FormSelect
                  name="alcance_servicio"
                  value={formData.alcance_servicio}
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
            title="Documentación y vencimientos"
            icon={<FaCalendarAlt />}
            color="green"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Vencimiento RTO" name="vencimiento_rto" required>
                <FormInput
                  type="date"
                  name="vencimiento_rto"
                  value={formData.vencimiento_rto}
                  onChange={handleChange}
                  required
                />
              </FormField>

              <FormField label="Vencimiento Visual Externa" name="vencimiento_visual_externa">
                <FormInput
                  type="date"
                  name="vencimiento_visual_externa"
                  value={formData.vencimiento_visual_externa}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Vencimiento Visual Interna" name="vencimiento_visual_interna">
                <FormInput
                  type="date"
                  name="vencimiento_visual_interna"
                  value={formData.vencimiento_visual_interna}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Vencimiento Espesores" name="vencimiento_espesores">
                <FormInput
                  type="date"
                  name="vencimiento_espesores"
                  value={formData.vencimiento_espesores}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Vencimiento Prueba Hidráulica" name="vencimiento_prueba_hidraulica">
                <FormInput
                  type="date"
                  name="vencimiento_prueba_hidraulica"
                  value={formData.vencimiento_prueba_hidraulica}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Vencimiento Mangueras" name="vencimiento_mangueras">
                <FormInput
                  type="date"
                  name="vencimiento_mangueras"
                  value={formData.vencimiento_mangueras}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Vencimiento Válvula Five" name="vencimiento_valvula_flujo">
                <FormInput
                  type="date"
                  name="vencimiento_valvula_flujo"
                  value={formData.vencimiento_valvula_flujo}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </FormSection>

          {/* No incluimos observaciones ya que no existe en el tipo Semirremolque de Supabase */}

          <div className="flex justify-end gap-4 pt-4">
            <FormButton
              type="button"
              onClick={() => navigate("/semirremolques")}
              variant="secondary"
            >
              Cancelar
            </FormButton>
            <FormButton
              type="submit"
              variant="primary"
            >
              {semirremolque ? "Actualizar" : "Crear"}
            </FormButton>
          </div>
        </form>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este semirremolque? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}