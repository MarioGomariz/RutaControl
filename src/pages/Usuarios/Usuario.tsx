import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsuariosStore } from '@/stores/usuariosStore';
import { User, UserWithPassword } from '@/utils/supabase';

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
          <button 
            onClick={() => navigate('/usuarios')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Volver"
          >
            <FaTimes size={20} />
          </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEditing ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
              </label>
              <input
                type="password"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña {!isEditing && '*'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                name="rol_id"
                value={formData.rol_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={1}>Administrador</option>
                <option value={2}>Chofer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/usuarios')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              <FaSave /> {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default Usuario;
