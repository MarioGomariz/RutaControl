import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaUser, FaKey, FaIdCard } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsuariosStore } from '@/stores/usuariosStore';
import type { Usuario as UsuarioType } from '@/types/usuario';
import { FormSection, FormField, FormInput, FormSelect, FormCheckbox, FormButton } from '@/components/FormComponents';

// Tipo de formulario: permite contrasena opcional cuando se edita
interface FormUser extends Omit<UsuarioType, 'id' | 'contrasena'> {
  contrasena?: string;
}

const Usuario: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedUsuario, isLoading, error: storeError, fetchUsuarioById, addUsuario, editUsuario, clearSelectedUsuario } = useUsuariosStore();
  const isEditing = id !== 'new';

  const parsedId = isEditing && id ? Number(id) : null;

  const [formData, setFormData] = useState<FormUser>({
    usuario: '',
    contrasena: '', // Campo temporal para el formulario, no se envía si está vacío en edición
    rol_id: 2, // 1=admin, 2=chofer
    activo: true,
  });
  
  const [error, setError] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Cargar usuario si estamos editando
  useEffect(() => {
    if (isEditing && parsedId !== null && !Number.isNaN(parsedId)) {
      fetchUsuarioById(parsedId);
    }
    // Limpiar el usuario seleccionado al desmontar el componente
    return () => clearSelectedUsuario();
  }, [parsedId, isEditing, fetchUsuarioById, clearSelectedUsuario]);

  // Actualizar formulario cuando se carga el usuario
  useEffect(() => {
    if (selectedUsuario) {
      setFormData({
        usuario: selectedUsuario.usuario,
        contrasena: '', // No mostrar la contraseña por seguridad
        rol_id: selectedUsuario.rol_id,
        activo: selectedUsuario.activo,
      });
    }
  }, [selectedUsuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = (): boolean => {
    // Validar campos requeridos
    if (!formData.usuario) {
      setError('El usuario es obligatorio');
      return false;
    }

    // Validar contraseña solo para nuevos usuarios o si se está cambiando
    if (!isEditing || formData.contrasena) {
      if (!isEditing && !formData.contrasena) {
        setError('La contraseña es obligatoria para nuevos usuarios');
        return false;
      }

      if (formData.contrasena && formData.contrasena.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      if (formData.contrasena !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      if (isEditing && parsedId !== null && selectedUsuario) {
        // Si estamos editando y no se proporciona contraseña, no la actualizamos
        const dataToUpdate: FormUser = { ...formData };
        if (!dataToUpdate.contrasena) {
          const { contrasena, ...rest } = dataToUpdate;
          await editUsuario(parsedId, rest);
        } else {
          // Si hay contraseña, la incluimos en la actualización
          await editUsuario(parsedId, dataToUpdate);
        }
      } else {
        // Para crear un nuevo usuario, la contraseña es obligatoria
        if (!formData.contrasena) {
          setError('La contraseña es obligatoria para crear un usuario');
          return;
        }
        // Crear el objeto a enviar (sin id)
        const nuevoUsuario: Omit<UsuarioType, 'id'> = {
          usuario: formData.usuario,
          contrasena: formData.contrasena,
          rol_id: formData.rol_id,
          activo: formData.activo,
        };
        await addUsuario(nuevoUsuario);
      }
      navigate('/usuarios');
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h1>
          <FormButton
            onClick={() => navigate('/usuarios')}
            title="Volver"
          >
            <FaTimes size={20} />
          </FormButton>
        </div>

        {(error || storeError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || storeError}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
              title="Información de acceso"
              icon={<FaUser />}
              color="blue"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Correo electronico del usuario" name="usuario" required>
                  <FormInput
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                    placeholder="Correo electronico del usuario"
                    required
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Seguridad"
              icon={<FaKey />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label={isEditing ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'} 
                  name="contrasena" 
                  required={!isEditing}
                >
                  <FormInput
                    type="password"
                    name="contrasena"
                    value={formData.contrasena || ''}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    required={!isEditing}
                  />
                </FormField>

                <FormField 
                  label={`Confirmar Contraseña ${!isEditing ? '*' : ''}`} 
                  name="confirmPassword"
                  required={!isEditing}
                >
                  <FormInput
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita la contraseña"
                    required={!isEditing}
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Rol y estado"
              icon={<FaIdCard />}
              color="green"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Rol" name="rol_id" required>
                  <FormSelect
                    name="rol_id"
                    value={formData.rol_id}
                    onChange={handleChange}
                    required
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Chofer</option>
                  </FormSelect>
                </FormField>

                <FormField label="Activo" name="activo">
                  <FormCheckbox
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
            </FormSection>

            <div className="flex justify-end space-x-4">
              <FormButton
                type="button"
                onClick={() => navigate('/usuarios')}
                variant="secondary"
              >
                Cancelar
              </FormButton>
              <FormButton
                type="submit"
                variant="primary"
                disabled={isLoading}
                icon={<FaSave />}
              >
                {isEditing ? 'Actualizar' : 'Guardar'}
              </FormButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Usuario;
