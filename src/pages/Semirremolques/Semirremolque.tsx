import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSemirremolquesStore } from "@/stores/semirremolquesStore";
import type { Semirremolque as SemirremolqueType } from "@/types/semirremolque";
import { useServiciosStore } from "@/stores/serviciosStore";
import { toast } from "react-toastify";
import ConfirmModal from '@/components/ConfirmModal';
import { FormSection, FormField, FormInput, FormSelect, FormButton } from '@/components/FormComponents';
import { FaTruck, FaCalendarAlt, FaGlobeAmericas } from 'react-icons/fa';
import { toDateInput, toSqlDate } from '@/helpers/dateFormater';
import { 
  SERVICE_DOCUMENTATION_CONFIG, 
  DOCUMENTATION_LABELS_FULL,
  shouldShowDocField as shouldShowField,
  getRequiredDocFields 
} from '@/utils/semirremolqueDocumentation';
import { useAuth } from '@/stores/authStore';
import { hasPermission } from '@/utils/permissions';
import { checkDominioExists } from '@/services/semirremolquesService';

export default function Semirremolque() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const parsedId = id && id !== 'new' ? Number(id) : null;
  const isEditing = parsedId !== null;
  
  // Mapeo de roles string a rol_id
  const roleToId: Record<string, number> = {
    'administrador': 1,
    'admin': 1,
    'chofer': 2,
    'analista': 3,
    'logistico': 4,
  };
  
  const rolId = user ? roleToId[user.role] || 0 : 0;
  const canDelete = hasPermission(rolId, 'delete_semirremolques');
  
  const { 
    selectedSemirremolque: semirremolque, 
    fetchSemirremolqueById, 
    addSemirremolque, 
    editSemirremolque,
    removeSemirremolque,
    isLoading,
    error,
    clearError,
    clearSelectedSemirremolque
  } = useSemirremolquesStore();
  
  const { servicios, fetchServicios } = useServiciosStore();
  
  useEffect(() => {
    if (parsedId !== null && !Number.isNaN(parsedId)) {
      fetchSemirremolqueById(parsedId);
    } else {
      // Si estamos en modo "nuevo", limpiar el semirremolque seleccionado
      clearSelectedSemirremolque();
    }
    
    // Cargar la lista de servicios disponibles
    fetchServicios();
    
    // Limpiar al desmontar el componente
    return () => clearSelectedSemirremolque();
  }, [parsedId, fetchSemirremolqueById, fetchServicios, clearSelectedSemirremolque]);

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
        vencimiento_rto: toDateInput(semirremolque.vencimiento_rto),
        vencimiento_visual_externa: toDateInput(semirremolque.vencimiento_visual_externa),
        vencimiento_visual_interna: toDateInput(semirremolque.vencimiento_visual_interna),
        vencimiento_espesores: toDateInput(semirremolque.vencimiento_espesores),
        vencimiento_prueba_hidraulica: toDateInput(semirremolque.vencimiento_prueba_hidraulica),
        vencimiento_mangueras: toDateInput(semirremolque.vencimiento_mangueras),
        vencimiento_valvula_flujo: toDateInput(semirremolque.vencimiento_valvula_flujo),
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
        setDominioError(`Ya existe un semirremolque con el dominio ${dominio} (${result.info})`);
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
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Si se está cambiando el dominio, limpiar el error anterior
    if (name === "dominio") {
      setDominioError("");
    }
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      };
      
      // Si se cambia el tipo de servicio, limpiar los campos de documentación no aplicables
      if (name === 'tipo_servicio') {
        const allowedFields = getRequiredDocFields(value);
        const allDocFields = Object.keys(SERVICE_DOCUMENTATION_CONFIG).flatMap(key => SERVICE_DOCUMENTATION_CONFIG[key]);
        const uniqueDocFields = [...new Set(allDocFields)];
        
        // Limpiar campos que no aplican al nuevo tipo de servicio
        uniqueDocFields.forEach(field => {
          if (!allowedFields.includes(field)) {
            newData[field as keyof typeof newData] = undefined as any;
          }
        });
      }
      
      return newData;
    });
  };

  // Función para determinar si un campo de documentación debe mostrarse
  const shouldShowDocField = (fieldName: string): boolean => {
    return shouldShowField(fieldName, formData.tipo_servicio);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Construir payload solo con campos relevantes según tipo de servicio
    const payload: any = {
      nombre: formData.nombre,
      dominio: formData.dominio,
      anio: formData.anio,
      estado: formData.estado,
      tipo_servicio: formData.tipo_servicio,
      alcance_servicio: formData.alcance_servicio,
    };
    
    // Agregar solo los campos de documentación que aplican al tipo de servicio
    const requiredFields = getRequiredDocFields(formData.tipo_servicio || '');
    requiredFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      payload[field] = toSqlDate(value as string | Date | null | undefined);
    });
    
    try {
      if (isEditing && parsedId !== null) {
        await editSemirremolque(parsedId, payload);
        toast.success("Semirremolque actualizado correctamente");
        navigate("/semirremolques");
      } else {
        await addSemirremolque(payload as Omit<SemirremolqueType, 'id'>);
        toast.success("Semirremolque agregado correctamente");
        navigate("/semirremolques");
      }
    } catch (err) {
      console.error("Error al guardar el semirremolque:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al guardar el semirremolque";
      toast.error(errorMessage);
      // No navegar, mantener al usuario en el formulario
    }
  };
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dominioError, setDominioError] = useState<string>("");
  const [isCheckingDominio, setIsCheckingDominio] = useState(false);

  const handleDelete = async () => {
    if (parsedId === null) return;
    
    try {
      await removeSemirremolque(parsedId);
      toast.success('Semirremolque eliminado correctamente');
      setShowDeleteModal(false);
      navigate('/semirremolques');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el semirremolque';
      toast.error(errorMessage);
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
              {isEditing ? "Editar semirremolque" : "Agregar semirremolque"}
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
            {!formData.tipo_servicio ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">Seleccione un tipo de servicio para ver los campos de documentación correspondientes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shouldShowDocField('vencimiento_rto') && (
                  <FormField label={DOCUMENTATION_LABELS_FULL['vencimiento_rto']} name="vencimiento_rto" required>
                    <FormInput
                      type="date"
                      name="vencimiento_rto"
                      value={formData.vencimiento_rto}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                )}

                {shouldShowDocField('vencimiento_visual_externa') && (
                  <FormField label={DOCUMENTATION_LABELS_FULL['vencimiento_visual_externa']} name="vencimiento_visual_externa" required>
                    <FormInput
                      type="date"
                      name="vencimiento_visual_externa"
                      value={formData.vencimiento_visual_externa}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                )}

                {shouldShowDocField('vencimiento_visual_interna') && (
                  <FormField label={DOCUMENTATION_LABELS_FULL['vencimiento_visual_interna']} name="vencimiento_visual_interna" required>
                    <FormInput
                      type="date"
                      name="vencimiento_visual_interna"
                      value={formData.vencimiento_visual_interna}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                )}

                {shouldShowDocField('vencimiento_espesores') && (
                  <FormField label={DOCUMENTATION_LABELS_FULL['vencimiento_espesores']} name="vencimiento_espesores" required>
                    <FormInput
                      type="date"
                      name="vencimiento_espesores"
                      value={formData.vencimiento_espesores}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                )}

                {shouldShowDocField('vencimiento_prueba_hidraulica') && (
                  <FormField label={DOCUMENTATION_LABELS_FULL['vencimiento_prueba_hidraulica']} name="vencimiento_prueba_hidraulica" required>
                    <FormInput
                      type="date"
                      name="vencimiento_prueba_hidraulica"
                      value={formData.vencimiento_prueba_hidraulica}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                )}

                {shouldShowDocField('vencimiento_mangueras') && (
                  <FormField label={DOCUMENTATION_LABELS_FULL['vencimiento_mangueras']} name="vencimiento_mangueras" required>
                    <FormInput
                      type="date"
                      name="vencimiento_mangueras"
                      value={formData.vencimiento_mangueras}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                )}

                {shouldShowDocField('vencimiento_valvula_flujo') && (
                  <FormField label={DOCUMENTATION_LABELS_FULL['vencimiento_valvula_flujo']} name="vencimiento_valvula_flujo" required>
                    <FormInput
                      type="date"
                      name="vencimiento_valvula_flujo"
                      value={formData.vencimiento_valvula_flujo}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                )}
              </div>
            )}
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
              disabled={!!dominioError || isCheckingDominio}
            >
              {isEditing ? "Actualizar" : "Guardar"}
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