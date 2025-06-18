import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaUser, FaKey, FaIdCard, FaClipboardList } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsuariosStore } from '@/stores/usuariosStore';
import { User, UserWithPassword } from '@/utils/supabase';
import { FormSection, FormField, FormInput, FormSelect, FormTextarea, FormButton } from '@/components/FormComponents';

// Extender el tipo User para incluir el campo contraseña para el formulario
interface FormUser extends Omit<User, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> {
  contraseña?: string;
}

const Usuario: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedUsuario, isLoading, error: storeError, fetchUsuarioById, addUsuario, editUsuario, clearSelectedUsuario } = useUsuariosStore();
  const isEditing = id !== 'new';

  const [formData, setFormData] = useState<FormUser>({
    nombre: '',
    apellido: '',
    email: '',
    usuario: '',
    contraseña: '', // Campo temporal para el formulario, no se almacena en Supabase
    rol_id: 2, // 1=admin, 2=chofer
    estado: 'Activo',
    observaciones: '',
    ultima_conexion: ''
  });
  
  const [error, setError] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Cargar usuario si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      fetchUsuarioById(id);
    }
    
    // Limpiar el usuario seleccionado al desmontar el componente
    return () => clearSelectedUsuario();
  }, [id, isEditing, fetchUsuarioById, clearSelectedUsuario]);

  // Actualizar formulario cuando se carga el usuario
  useEffect(() => {
    if (selectedUsuario) {
      setFormData({
        nombre: selectedUsuario.nombre,
        apellido: selectedUsuario.apellido,
        email: selectedUsuario.email,
        usuario: selectedUsuario.usuario,
        contraseña: '', // No mostrar la contraseña por seguridad
        rol_id: selectedUsuario.rol_id,
        estado: selectedUsuario.estado,
        observaciones: selectedUsuario.observaciones || '',
        ultima_conexion: selectedUsuario.ultima_conexion
      });
    }
  }, [selectedUsuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    // Validar campos requeridos
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.usuario) {
      setError('Todos los campos marcados con * son obligatorios');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del email no es válido');
      return false;
    }

    // Validar contraseña solo para nuevos usuarios o si se está cambiando
    if (!isEditing || formData.contraseña) {
      if (!isEditing && !formData.contraseña) {
        setError('La contraseña es obligatoria para nuevos usuarios');
        return false;
      }

      if (formData.contraseña && formData.contraseña.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      if (formData.contraseña !== confirmPassword) {
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
      if (isEditing && id && selectedUsuario) {
        // Si estamos editando y no se proporciona contraseña, no la actualizamos
        const dataToUpdate: FormUser = { ...formData };
        if (!dataToUpdate.contraseña) {
          const { contraseña, ...rest } = dataToUpdate;
          await editUsuario(id, rest);
        } else {
          // Si hay contraseña, la incluimos en la actualización
          await editUsuario(id, dataToUpdate);
        }
      } else {
        // Para crear un nuevo usuario, la contraseña es obligatoria
        if (!formData.contraseña) {
          setError('La contraseña es obligatoria para crear un usuario');
          return;
        }
        
        // Crear un objeto UserWithPassword con la contraseña obligatoria
        const nuevoUsuario: UserWithPassword = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          usuario: formData.usuario,
          contraseña: formData.contraseña,
          rol_id: formData.rol_id,
          estado: formData.estado as 'Activo' | 'Inactivo' | 'Suspendido',
          ultima_conexion: formData.ultima_conexion || new Date().toISOString(),
          observaciones: formData.observaciones
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
              title="Información personal"
              icon={<FaUser />}
              color="blue"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nombre" name="nombre" required>
                  <FormInput
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre del usuario"
                    required
                  />
                </FormField>
                
                <FormField label="Apellido" name="apellido" required>
                  <FormInput
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Apellido del usuario"
                    required
                  />
                </FormField>

                <FormField label="Email" name="email" required>
                  <FormInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </FormField>

                <FormField label="Nombre de Usuario" name="usuario" required>
                  <FormInput
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                    placeholder="Nombre de usuario para acceso"
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
                  name="contraseña" 
                  required={!isEditing}
                >
                  <FormInput
                    type="password"
                    name="contraseña"
                    value={formData.contraseña}
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

                <FormField label="Estado" name="estado" required>
                  <FormSelect
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Suspendido">Suspendido</option>
                  </FormSelect>
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Información adicional"
              icon={<FaClipboardList />}
              color="amber"
            >
              <FormField label="Observaciones" name="observaciones">
                <FormTextarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  placeholder="Notas adicionales sobre el usuario"
                  rows={4}
                />
              </FormField>
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
