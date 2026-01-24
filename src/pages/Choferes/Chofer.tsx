import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChoferesStore } from "@/stores/choferesStore";
import { updateChoferPassword } from "@/services/choferesService";
import type { Chofer } from "@/types/chofer";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import { FormSection, FormField, FormInput, FormCheckbox, FormButton } from '@/components/FormComponents';
import { FaUserTie, FaIdCard, FaAddressCard } from 'react-icons/fa';
import { toDateInput, toSqlDate } from '@/helpers/dateFormater';

export default function ChoferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedChofer, 
    isLoading, 
    error: choferError, 
    fetchChoferById, 
    addChofer, 
    editChofer, 
    removeChofer,
    clearSelectedChofer 
  } = useChoferesStore();

  const isEditing = id !== 'new';
  const parsedId = isEditing && id ? Number(id) : null;

  useEffect(() => {
    if (isEditing && parsedId !== null && !Number.isNaN(parsedId)) {
      fetchChoferById(parsedId);
    }
    return () => clearSelectedChofer();
  }, [parsedId, isEditing, fetchChoferById, clearSelectedChofer]);

  interface ChoferForm extends Omit<Chofer, 'id' | 'usuario_id'> {}

  const [formData, setFormData] = useState<ChoferForm>({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    licencia: "",
    fecha_vencimiento_licencia: "",
    activo: false,
  });

  useEffect(() => {
    if (selectedChofer) {
      setFormData({
        nombre: selectedChofer.nombre,
        apellido: selectedChofer.apellido,
        dni: selectedChofer.dni,
        telefono: selectedChofer.telefono,
        email: selectedChofer.email,
        licencia: selectedChofer.licencia,
        fecha_vencimiento_licencia: toDateInput(selectedChofer.fecha_vencimiento_licencia),
        activo: selectedChofer.activo
      });
    }
  }, [selectedChofer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [error, setError] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newChoferId, setNewChoferId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (parsedId === null) return;
    
    try {
      // Eliminar el chofer (el servicio se encarga de eliminar también el usuario asociado)
      await removeChofer(parsedId);
      toast.success("Chofer eliminado correctamente");
      setShowDeleteModal(false);
      navigate("/choferes");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el chofer");
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...formData,
      fecha_vencimiento_licencia: toSqlDate(formData.fecha_vencimiento_licencia),
    };

    try {
      if (isEditing && parsedId !== null) {
        await editChofer(parsedId, payload);
        toast.success("Chofer actualizado correctamente");
        navigate("/choferes");
      } else {
        await addChofer(payload as Omit<Chofer, 'id'>);
        toast.success("Chofer creado correctamente");

        if (formData.email) {
          const nuevoChofer = useChoferesStore.getState().selectedChofer;
          if (nuevoChofer) {
            setNewChoferId(nuevoChofer.id);
            setShowPasswordModal(true);
          } 
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
    }
  };

  const handleCreateUsuario = async () => {
    setPasswordError('');

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      if (newChoferId) {
        // Actualizar la contraseña del usuario ya creado por el backend
        await updateChoferPassword(String(newChoferId), password);
        toast.success("Contraseña configurada correctamente");
      }

      setShowPasswordModal(false);
      navigate("/choferes");
    } catch (err: any) {
      setPasswordError(err.message || 'Error al configurar la contraseña');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar chofer" : "Agregar chofer"}
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

        {(error || choferError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || choferError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
              title="Información personal"
              icon={<FaUserTie />}
              color="blue"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nombre" name="nombre" required>
                  <FormInput
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField label="Apellido" name="apellido" required>
                  <FormInput
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField label="DNI" name="dni" required>
                  <FormInput
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField label="Teléfono" name="telefono">
                  <FormInput
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Email" name="email">
                  <FormInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Información de licencia"
              icon={<FaIdCard />}
              color="amber"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Licencia" name="licencia" required>
                  <FormInput
                    type="text"
                    name="licencia"
                    value={formData.licencia}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField label="Fecha vencimiento licencia" name="fecha_vencimiento_licencia" required>
                  <FormInput
                    type="date"
                    name="fecha_vencimiento_licencia"
                    value={formData.fecha_vencimiento_licencia || ''}
                    onChange={handleChange}
                    required
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Estado"
              icon={<FaAddressCard />}
              color="green"
            >
              <FormField label="Activo" name="activo">
                <FormCheckbox
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
              </FormField>
            </FormSection>

            <div className="flex justify-end space-x-4 mt-8">
              <FormButton
                type="button"
                onClick={() => navigate("/choferes")}
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
        message="¿Está seguro que desea eliminar este chofer? Esta acción también eliminará el usuario asociado si existe."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

      {/* Modal para crear usuario */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Crear usuario para el chofer</h2>
            <p className="mb-4 text-gray-600">Se creará un usuario con el email del chofer. Por favor, establezca una contraseña:</p>
            
            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {passwordError}
              </div>
            )}
            
            <FormField label="Contraseña" name="password">
              <FormInput
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </FormField>
            
            <FormField label="Confirmar contraseña" name="confirmPassword">
              <FormInput
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </FormField>
            
            <div className="flex justify-end gap-4 mt-6">
              <FormButton
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  navigate("/choferes");
                }}
                variant="secondary"
              >
                Cancelar
              </FormButton>
              <FormButton
                type="button"
                onClick={handleCreateUsuario}
                variant="primary"
              >
                Crear usuario
              </FormButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
