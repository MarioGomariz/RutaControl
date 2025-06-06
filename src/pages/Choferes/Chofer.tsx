import { createChofer, getChoferById, updateChofer } from "@/utils/choferes";
import { createUsuarioFromChofer } from "@/utils/usuarios";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Chofer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chofer = getChoferById(id || "");

  const [formData, setFormData] = useState({
    nombre: chofer?.nombre || "",
    apellido: chofer?.apellido || "",
    dni: chofer?.dni || "",
    telefono: chofer?.telefono || "",
    email: chofer?.email || "",
    licencia: chofer?.licencia || "",
    fechaVencimientoLicencia: chofer?.fechaVencimientoLicencia || "",
    activo: chofer?.activo || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newChoferId, setNewChoferId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (chofer) {
      // Si estamos editando un chofer existente
      updateChofer(id || "", formData);
      navigate("/choferes");
    } else {
      // Si estamos creando un nuevo chofer
      if (formData.email) {
        // Si tiene email, mostrar modal para crear usuario
        const nuevoChofer = createChofer(formData);
        setNewChoferId(nuevoChofer.id);
        setShowPasswordModal(true);
      } else {
        // Si no tiene email, simplemente crear el chofer
        createChofer(formData);
        navigate("/choferes");
      }
    }
  };
  
  const handleCreateUsuario = () => {
    setPasswordError('');
    
    // Validar contraseña
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    if (newChoferId) {
      const choferCreado = getChoferById(newChoferId);
      if (choferCreado && choferCreado.email) {
        // Crear usuario asociado al chofer
        createUsuarioFromChofer(choferCreado, password);
      }
    }
    
    setShowPasswordModal(false);
    navigate("/choferes");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {chofer ? "Editar chofer" : "Agregar chofer"}
          </h1>
        </div>
      
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

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs dinámicos */}
        {[
          { label: "Nombre", name: "nombre", type: "text" },
          { label: "Apellido", name: "apellido", type: "text" },
          { label: "DNI", name: "dni", type: "text" },
          { label: "Teléfono", name: "telefono", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Licencia", name: "licencia", type: "text" },
          { label: "Fecha de vencimiento de licencia", name: "fechaVencimientoLicencia", type: "date" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={name}>{label}:</label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name as keyof typeof formData] as string}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>
        ))}

        {/* Checkbox activo */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="ml-2 block text-sm font-medium text-gray-700">Activo</label>
          </div>
        </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/choferes")}
            className="px-5 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {chofer ? "Editar" : "Agregar"}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
