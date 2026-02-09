import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChoferesStore } from "@/stores/choferesStore";
import { updateChoferPassword } from "@/services/choferesService";
import type { Chofer } from "@/types/chofer";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import { FormSection, FormField, FormInput, FormCheckbox, FormButton } from '@/components/FormComponents';
import { FaUserTie, FaIdCard, FaAddressCard, FaKey } from 'react-icons/fa';
import { toDateInput, toSqlDate } from '@/helpers/dateFormater';
import { useAuth } from '@/stores/authStore';
import { hasPermission } from '@/utils/permissions';

export default function ChoferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  
  // Mapeo de roles string a rol_id
  const roleToId: Record<string, number> = {
    'administrador': 1,
    'admin': 1,
    'chofer': 2,
    'analista': 3,
    'logistico': 4,
  };
  
  const rolId = user ? roleToId[user.role] || 0 : 0;
  const isLogistico = user?.role === 'logistico';
  const canDelete = hasPermission(rolId, 'delete_choferes');

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
    activo: true,
    estado: 'disponible',
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
        activo: selectedChofer.activo,
        estado: selectedChofer.estado
      });
    }
  }, [selectedChofer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    // Validación especial para teléfono
    if (name === 'telefono') {
      // Solo permitir números
      const numericValue = value.replace(/\D/g, '');
      
      // Limitar a 10 dígitos
      const limitedValue = numericValue.slice(0, 10);
      
      // Validar longitud
      if (limitedValue.length > 0 && limitedValue.length < 10) {
        setTelefonoError('El teléfono debe tener 10 dígitos');
      } else {
        setTelefonoError('');
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: limitedValue,
      }));
      return;
    }
    
    // Si se cambia el checkbox activo, actualizar estado automáticamente
    if (name === 'activo') {
      // Solo permitir cambiar a inactivo si no hay licencia vencida o si está creando nuevo
      setFormData((prev) => ({
        ...prev,
        activo: checked,
        // Si se activa, el estado será 'disponible' solo si no hay vencimientos
        // Si se desactiva, el estado será 'inactivo'
        estado: checked ? 'disponible' : 'inactivo',
      }));
      return;
    }
    
    // Si cambia la fecha de vencimiento, recalcular disponibilidad
    if (name === 'fecha_vencimiento_licencia') {
      const newDate = value;
      setFormData((prev) => {
        // Si está activo y no en viaje, verificar vencimiento
        if (prev.activo && prev.estado !== 'en viaje' && newDate) {
          const vencimiento = new Date(newDate);
          const hoy = new Date();
          const estaVencido = vencimiento < hoy;
          
          return {
            ...prev,
            [name]: value,
            // Si la licencia está vencida, no puede estar disponible
            estado: estaVencido ? 'inactivo' : 'disponible',
            activo: estaVencido ? false : prev.activo,
          };
        }
        return {
          ...prev,
          [name]: value,
        };
      });
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [error, setError] = useState<string>('');
  const [telefonoError, setTelefonoError] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newChoferId, setNewChoferId] = useState<number | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
          console.log('[FRONTEND] Chofer creado, selectedChofer:', nuevoChofer);
          if (nuevoChofer) {
            console.log('[FRONTEND] Mostrando modal de contraseña para chofer ID:', nuevoChofer.id);
            setNewChoferId(nuevoChofer.id);
            setShowPasswordModal(true);
          } else {
            console.error('[FRONTEND] Error: selectedChofer es null después de crear');
            navigate("/choferes");
          }
        } else {
          navigate("/choferes");
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ha ocurrido un error';
      setError(errorMessage);
      toast.error(errorMessage);
      // No navegar, mantener al usuario en el formulario
    }
  };

  const handleCreateUsuario = async () => {
    setPasswordError('');
    console.log('[FRONTEND] handleCreateUsuario llamado, newChoferId:', newChoferId);

    if (password.length < 6) {
      console.log('[FRONTEND] Error: Contraseña muy corta');
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      console.log('[FRONTEND] Error: Contraseñas no coinciden');
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      if (newChoferId) {
        console.log('[FRONTEND] Actualizando contraseña para chofer ID:', newChoferId);
        // Actualizar la contraseña del usuario ya creado por el backend
        await updateChoferPassword(String(newChoferId), password);
        console.log('[FRONTEND] Contraseña actualizada exitosamente');
        toast.success("Contraseña configurada correctamente");
      } else {
        console.error('[FRONTEND] Error: newChoferId es null');
      }

      setShowPasswordModal(false);
      navigate("/choferes");
    } catch (err: any) {
      console.error('[FRONTEND] Error al configurar contraseña:', err);
      setPasswordError(err.message || 'Error al configurar la contraseña');
    }
  };

  const handleChangePassword = async () => {
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
      if (parsedId) {
        await updateChoferPassword(String(parsedId), password);
        toast.success("Contraseña actualizada correctamente");
        setPassword('');
        setConfirmPassword('');
        setShowChangePassword(false);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error al cambiar la contraseña');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar chofer" : "Agregar chofer"}
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
        
        {isLogistico && isEditing && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Modo de edición limitada</p>
            <p className="text-sm">Como usuario logístico, solo puede editar la fecha de vencimiento de licencia.</p>
          </div>
        )}

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
                    placeholder="Nombre del chofer"
                    required
                    disabled={isLogistico}
                  />
                </FormField>

                <FormField label="Apellido" name="apellido" required>
                  <FormInput
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Apellido del chofer"
                    required
                    disabled={isLogistico}
                  />
                </FormField>

                <FormField label="DNI" name="dni" required>
                  <FormInput
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="DNI del chofer"
                    required
                    disabled={isLogistico}
                  />
                </FormField>

                <FormField label="Teléfono" name="telefono" required>
                  <FormInput
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="10 dígitos (ej: 2994232821)"
                    required
                    disabled={isLogistico}
                    maxLength={10}
                  />
                  {telefonoError && (
                    <p className="text-sm text-red-600 mt-1">{telefonoError}</p>
                  )}
                  {formData.telefono && formData.telefono.length === 10 && (
                    <p className="text-sm text-green-600 mt-1">✓ Teléfono válido</p>
                  )}
                </FormField>

                <FormField label="Email" name="email" required>
                  <FormInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email del chofer"
                    required
                    disabled={isLogistico}
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
                <FormField label="Número de Licencia" name="licencia" required>
                  <FormInput
                    type="text"
                    name="licencia"
                    value={formData.licencia}
                    onChange={handleChange}
                    placeholder="Número de licencia"
                    required
                    disabled={isLogistico}
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
              <div className="space-y-4">
                <FormField label="Activo" name="activo">
                  <FormCheckbox
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    disabled={isLogistico}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.activo 
                      ? 'El chofer está habilitado para trabajar' 
                      : 'El chofer está deshabilitado y no podrá iniciar sesión'}
                  </p>
                </FormField>


              </div>
            </FormSection>

            {isEditing && !isLogistico && (
              <FormSection
                title="Seguridad"
                icon={<FaKey />}
                color="rose"
              >
                {!showChangePassword ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      El chofer tiene un usuario asociado para iniciar sesión.
                    </p>
                    <FormButton
                      type="button"
                      onClick={() => setShowChangePassword(true)}
                      variant="secondary"
                    >
                      Cambiar contraseña
                    </FormButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {passwordError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {passwordError}
                      </div>
                    )}
                    
                    <FormField label="Nueva contraseña" name="newPassword">
                      <FormInput
                        type="password"
                        name="newPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </FormField>
                    
                    <FormField label="Confirmar contraseña" name="confirmNewPassword">
                      <FormInput
                        type="password"
                        name="confirmNewPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita la contraseña"
                      />
                    </FormField>
                    
                    <div className="flex gap-2">
                      <FormButton
                        type="button"
                        onClick={handleChangePassword}
                        variant="primary"
                      >
                        Guardar contraseña
                      </FormButton>
                      <FormButton
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                        }}
                        variant="secondary"
                      >
                        Cancelar
                      </FormButton>
                    </div>
                  </div>
                )}
              </FormSection>
            )}

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
