import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServiciosStore } from "@/stores/serviciosStore";
import { toast } from "react-toastify";
import ConfirmModal from '@/components/ConfirmModal';
import { FormSection, FormField, FormInput, FormCheckbox, FormButton, FormTextarea } from '@/components/FormComponents';
import { FaTools, FaClipboardList } from 'react-icons/fa';
import type { Servicio } from '@/types/servicio';

export default function Servicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedServicio, 
    isLoading, 
    error, 
    fetchServicioById, 
    addServicio, 
    editServicio, 
    removeServicio,
    clearSelectedServicio 
  } = useServiciosStore();
  
  const isEditing = id !== 'new';
  const parsedId = isEditing && id ? Number(id) : null;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Servicio, 'id'>>({
    nombre: "",
    descripcion: "",
    requiere_prueba_hidraulica: false,
    requiere_visuales: false,
    requiere_valvula_y_mangueras: false,
  });
  
  useEffect(() => {
    if (isEditing && parsedId !== null && !Number.isNaN(parsedId)) {
      fetchServicioById(parsedId);
    }
    
    return () => clearSelectedServicio();
  }, [parsedId, isEditing, fetchServicioById, clearSelectedServicio]);
  
  useEffect(() => {
    if (selectedServicio) {
      setFormData({
        nombre: selectedServicio.nombre,
        descripcion: selectedServicio.descripcion || "", 
        requiere_prueba_hidraulica: selectedServicio.requiere_prueba_hidraulica,
        requiere_visuales: selectedServicio.requiere_visuales,  
        requiere_valvula_y_mangueras: selectedServicio.requiere_valvula_y_mangueras,
      });
    }
  }, [selectedServicio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (isEditing && parsedId !== null) {
        await editServicio(parsedId, formData);
        toast.success('Servicio actualizado correctamente');
      } else {
        await addServicio(formData);
        toast.success('Servicio creado correctamente');
      }
      navigate("/servicios");
    } catch (err: any) {
      // El error ya se maneja en el store
      console.error(err);
      toast.error('Error al guardar el servicio');
    }
  };

  const handleDelete = async () => {
    if (parsedId === null) return;
    
    try {
      await removeServicio(parsedId);
      toast.success('Servicio eliminado correctamente');
      setShowDeleteModal(false);
      navigate('/servicios');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el servicio');
      setShowDeleteModal(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar servicio" : "Agregar servicio"}
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

        {isLoading && !selectedServicio && isEditing ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <FormSection
              title="Información del servicio"
              icon={<FaTools />}
              color="blue"
            >
              <div className="grid grid-cols-1 gap-6">
                <FormField label="Nombre" name="nombre" required>
                  <FormInput
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre del servicio"
                    required
                  />
                </FormField>

                <FormField label="Descripción" name="descripcion" required>
                  <FormTextarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción detallada del servicio"
                    rows={3}
                    required
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Requerimientos del servicio"
              icon={<FaClipboardList />}
              color="amber"
            >
              <div className="space-y-3">
                <FormField label="Requiere prueba hidráulica" name="requiere_prueba_hidraulica">
                  <FormCheckbox
                    name="requiere_prueba_hidraulica"
                    checked={formData.requiere_prueba_hidraulica}
                    onChange={handleChange}
                  />
                </FormField>
                
                <FormField label="Requiere visuales" name="requiere_visuales">
                  <FormCheckbox
                    name="requiere_visuales"
                    checked={formData.requiere_visuales}
                    onChange={handleChange}
                  />
                </FormField>
                
                <FormField label="Requiere válvula y mangueras" name="requiere_valvula_y_mangueras">
                  <FormCheckbox
                    name="requiere_valvula_y_mangueras"
                    checked={formData.requiere_valvula_y_mangueras}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
            </FormSection>

           

            <div className="flex justify-end gap-4 pt-4">
              <FormButton
                type="button"
                onClick={() => navigate("/servicios")}
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
        message="¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}