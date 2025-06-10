import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChoferesStore } from "@/stores/choferesStore";
import { useUsuariosStore } from "@/stores/usuariosStore";
import { Chofer } from "@/utils/supabase";

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
    clearSelectedChofer 
  } = useChoferesStore();
  const { addUsuario } = useUsuariosStore();

  const isEditing = id !== 'new';

  useEffect(() => {
    if (isEditing && id) {
      fetchChoferById(id);
    }
    return () => clearSelectedChofer();
  }, [id, isEditing, fetchChoferById, clearSelectedChofer]);

  interface ChoferForm extends Omit<Chofer, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> {
    fecha_vencimiento_licencia: string;
  }

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
        fecha_vencimiento_licencia: selectedChofer.fecha_vencimiento_licencia,
        activo: selectedChofer.activo,
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newChoferId, setNewChoferId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditing && id) {
        await editChofer(id, formData);
        navigate("/choferes");
      } else {
        await addChofer(formData);

        if (formData.email) {
          const nuevoChofer = useChoferesStore.getState().selectedChofer;
          if (nuevoChofer) {
            setNewChoferId(nuevoChofer.id);
            setShowPasswordModal(true);
          } else {
            navigate("/choferes");
          }
        } else {
          navigate("/choferes");
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
        await addUsuario({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          usuario: formData.email.split('@')[0],
          contraseña: password,
          rol_id: 2,
          estado: 'Activo',
          ultima_conexion: new Date().toISOString(),
          observaciones: `Usuario creado automáticamente para el chofer ID: ${newChoferId}`
        } as any);
      }

      setShowPasswordModal(false);
      navigate("/choferes");
    } catch (err: any) {
      setPasswordError(err.message || 'Error al crear el usuario');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar chofer" : "Agregar chofer"}
          </h1>
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
                  DNI *
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Licencia *
                </label>
                <input
                  type="text"
                  name="licencia"
                  value={formData.licencia}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha vencimiento licencia *
                </label>
                <input
                  type="date"
                  name="fecha_vencimiento_licencia"
                  value={formData.fecha_vencimiento_licencia}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Activo
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => navigate("/choferes")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isEditing ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>

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
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength={6}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  navigate("/choferes");
                }}
                className="px-5 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateUsuario}
                className="px-5 py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Crear usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
