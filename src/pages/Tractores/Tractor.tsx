import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTractoresStore } from "@/stores/tractoresStore";
import { useServiciosStore } from "@/stores/serviciosStore";
import { toast } from "react-toastify";
import ConfirmModal from '@/components/ConfirmModal';
import { FormSection, FormField, FormInput, FormSelect, FormCheckbox, FormButton } from '@/components/FormComponents';
import { FaTruck, FaCalendarAlt, FaGlobeAmericas } from 'react-icons/fa';

export default function Tractor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedTractor, 
    isLoading, 
    error, 
    fetchTractorById, 
    addTractor, 
    editTractor, 
    removeTractor,
    clearSelectedTractor 
  } = useTractoresStore();
  
  const { servicios, fetchServicios } = useServiciosStore();
  
  const isEditing = id !== 'new';

  useEffect(() => {
    if (isEditing && id) {
      fetchTractorById(id);
    }
    
    // Cargar la lista de servicios disponibles
    fetchServicios();
    
    return () => clearSelectedTractor();
  }, [id, isEditing, fetchTractorById, fetchServicios, clearSelectedTractor]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    dominio: "",
    año: new Date().getFullYear(),
    vencimiento_rto: "",
    estado: "Disponible",
    tipo_servicio: "",
    alcance_servicio: false,
  });
  
  useEffect(() => {
    if (selectedTractor) {
      setFormData({
        marca: selectedTractor.marca,
        modelo: selectedTractor.modelo,
        dominio: selectedTractor.dominio,
        año: selectedTractor.año,
        vencimiento_rto: selectedTractor.vencimiento_rto,
        estado: selectedTractor.estado,
        tipo_servicio: selectedTractor.tipo_servicio,
        alcance_servicio: selectedTractor.alcance_servicio,
      });
    }
  }, [selectedTractor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
              type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (isEditing && id) {
        await editTractor(id, formData);
        toast.success("Tractor actualizado correctamente");
      } else {
        await addTractor(formData);
        toast.success("Tractor agregado correctamente");
      }
      navigate("/tractores");
    } catch (err: any) {
      // El error ya se maneja en el store
      console.error(err);
      toast.error("Error al guardar el tractor");
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await removeTractor(id);
      toast.success('Tractor eliminado correctamente');
      setShowDeleteModal(false);
      navigate('/tractores');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el tractor');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar tractor" : "Agregar tractor"}
          </h1>
          {isEditing && (
            <FormButton
              type="button"
              onClick={() => setShowDeleteModal(true)}
              variant="danger"
            >
              Eliminar
            </FormButton>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading && !selectedTractor && isEditing ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <FormSection
              title="Información del vehículo"
              icon={<FaTruck />}
              color="blue"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Marca" name="marca" required>
                  <FormInput
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Marca del tractor"
                    required
                  />
                </FormField>

                <FormField label="Modelo" name="modelo" required>
                  <FormInput
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="Modelo del tractor"
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

                <FormField label="Año" name="año" required>
                  <FormInput
                    type="number"
                    name="año"
                    value={formData.año}
                    onChange={handleChange}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Documentación y estado"
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

                <FormField label="Estado" name="estado" required>
                  <FormSelect
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En reparación">En reparación</option>
                    <option value="En viaje">En viaje</option>
                    <option value="Fuera de servicio">Fuera de servicio</option>
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

                <FormField label="Alcance del Servicio" name="alcance_servicio">
                  <FormCheckbox
                    name="alcance_servicio"
                    checked={formData.alcance_servicio}
                    onChange={handleChange}
                    label="Alcance Internacional"
                  />
                </FormField>
              </div>
            </FormSection>

            <div className="flex justify-end gap-4 pt-4">
              <FormButton
                type="button"
                onClick={() => navigate("/tractores")}
                variant="secondary"
              >
                Cancelar
              </FormButton>
              <FormButton
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isEditing ? "Actualizar" : "Guardar"}
              </FormButton>
            </div>
          </form>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este tractor? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}