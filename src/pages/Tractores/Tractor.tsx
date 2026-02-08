import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTractoresStore } from "@/stores/tractoresStore";
import type { Tractor as TractorType } from "@/types/tractor";

import { useServiciosStore } from "@/stores/serviciosStore";
import { toast } from "react-toastify";
import ConfirmModal from '@/components/ConfirmModal';
import { FormSection, FormField, FormInput, FormSelect, FormButton } from '@/components/FormComponents';
import { FaTruck, FaCalendarAlt, FaGlobeAmericas } from 'react-icons/fa';
import { toDateInput, toSqlDate } from '@/helpers/dateFormater';
import { useAuth } from '@/stores/authStore';
import { hasPermission } from '@/utils/permissions';
import { checkDominioExists } from '@/services/tractoresService';

export default function Tractor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const parsedId = isEditing && id ? Number(id) : null;
  
  // Mapeo de roles string a rol_id
  const roleToId: Record<string, number> = {
    'administrador': 1,
    'admin': 1,
    'chofer': 2,
    'analista': 3,
    'logistico': 4,
  };
  
  const rolId = user ? roleToId[user.role] || 0 : 0;
  const canDelete = hasPermission(rolId, 'delete_tractores');

  useEffect(() => {
    if (isEditing && parsedId !== null && !Number.isNaN(parsedId)) {
      fetchTractorById(parsedId);
    } else {
      // Si estamos en modo "nuevo", limpiar el tractor seleccionado
      clearSelectedTractor();
    }
    
    // Cargar la lista de servicios disponibles
    fetchServicios();
    
    // Limpiar al desmontar el componente
    return () => clearSelectedTractor();
  }, [parsedId, isEditing, fetchTractorById, fetchServicios, clearSelectedTractor]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dominioError, setDominioError] = useState<string>("");
  const [isCheckingDominio, setIsCheckingDominio] = useState(false);
  const [formData, setFormData] = useState<Partial<TractorType>>({
    marca: "",
    modelo: "",
    dominio: "",
    anio: new Date().getFullYear(),
    vencimiento_rto: "",
    estado: "disponible",
    tipo_servicio: "",
    alcance_servicio: "nacional",
  });
  
  useEffect(() => {
    if (selectedTractor) {
      setFormData({
        marca: selectedTractor.marca,
        modelo: selectedTractor.modelo,
        dominio: selectedTractor.dominio,
        anio: selectedTractor.anio,
        vencimiento_rto: toDateInput(selectedTractor.vencimiento_rto),
        estado: selectedTractor.estado,
        tipo_servicio: selectedTractor.tipo_servicio,
        alcance_servicio: selectedTractor.alcance_servicio,
      });
    }
  }, [selectedTractor]);

  // Validación de dominio con debounce
  const checkDominio = useCallback(async (dominio: string) => {
    if (!dominio || dominio.trim() === "") {
      setDominioError("");
      return;
    }
    
    setIsCheckingDominio(true);
    try {
      const excludeId = isEditing && parsedId ? String(parsedId) : undefined;
      const result = await checkDominioExists(dominio, excludeId);
      
      if (result.exists) {
        setDominioError(`Ya existe un tractor con el dominio ${dominio} (${result.info})`);
      } else {
        setDominioError("");
      }
    } catch (error) {
      console.error('Error al verificar dominio:', error);
    } finally {
      setIsCheckingDominio(false);
    }
  }, [isEditing, parsedId]);
  
  // Debounce para la validación del dominio
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.dominio) {
        checkDominio(formData.dominio);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.dominio, checkDominio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    // Si se está cambiando el dominio, limpiar el error anterior
    if (name === "dominio") {
      setDominioError("");
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
              type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...formData,
      vencimiento_rto: toSqlDate(formData.vencimiento_rto),
    };

    console.log(payload);
    
    try {
      if (isEditing && parsedId !== null) {
        await editTractor(parsedId, payload);
        toast.success("Tractor actualizado correctamente");
        navigate("/tractores");
      } else {
        await addTractor(payload as Omit<TractorType, 'id'>);
        toast.success("Tractor agregado correctamente");
        navigate("/tractores");
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Error al guardar el tractor";
      toast.error(errorMessage);
    }
  };
  
  const handleDelete = async () => {
    if (parsedId === null) return;
    
    try {
      await removeTractor(parsedId);
      toast.success('Tractor eliminado correctamente');
      setShowDeleteModal(false);
      navigate('/tractores');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el tractor';
      toast.error(errorMessage);
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
          {isEditing && canDelete && (
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
                  {isCheckingDominio && (
                    <p className="text-sm text-blue-600 mt-1">Verificando dominio...</p>
                  )}
                  {dominioError && (
                    <p className="text-sm text-red-600 mt-1">{dominioError}</p>
                  )}
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
                    <option value="disponible">Disponible</option>
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
                    disabled={isEditing}
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
                disabled={!!dominioError || isCheckingDominio}
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