import React, { useState, useEffect } from 'react';
import { getAllUsuarios, Usuario, searchUsuarios, deleteUsuario, updateUsuarioEstado } from '@/utils/usuarios';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaUserSlash, FaUserCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Cargar usuarios al iniciar
  useEffect(() => {
    loadUsuarios();
  }, []);

  // Cargar todos los usuarios o filtrados por búsqueda
  const loadUsuarios = () => {
    if (searchQuery.trim()) {
      setUsuarios(searchChoferes(searchQuery));
    } else {
      setUsuarios(getAllUsuarios());
    }
  };

  // Buscar usuarios
  const searchChoferes = (query: string) => {
    return searchUsuarios(query);
  };

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      setUsuarios(searchUsuarios(e.target.value));
    } else {
      setUsuarios(getAllUsuarios());
    }
  };

  // Abrir formulario para editar
  const handleEdit = (usuario: Usuario) => {
    navigate(`/usuario/${usuario.id}`);
  };

  // Eliminar usuario
  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      deleteUsuario(id);
      loadUsuarios();
    }
  };

  // Cambiar estado del usuario
  const handleToggleStatus = (usuario: Usuario) => {
    const newStatus = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';
    updateUsuarioEstado(usuario.id, newStatus);
    loadUsuarios();
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-AR');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestión de Usuarios</h1>
      
      {/* Barra de búsqueda y botón de agregar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, email o usuario..."
            className="w-full p-2 pl-10 border rounded-lg bg-white text-gray-800"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/usuario/new')}
        >
          <FaUserPlus /> Agregar Usuario
        </button>
      </div>

      {/* Lista de usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.map((usuario) => (
          <div 
            key={usuario.id}
            className={`border rounded-lg shadow-md p-5 bg-white ${
              usuario.estado === 'Activo' 
                ? 'border-green-300' 
                : usuario.estado === 'Suspendido' 
                  ? 'border-yellow-300' 
                  : 'border-red-300'
            } hover:shadow-lg transition-shadow`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-800">{usuario.nombre} {usuario.apellido}</h3>
              <span 
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  usuario.estado === 'Activo' 
                    ? 'bg-green-100 text-green-800' 
                    : usuario.estado === 'Suspendido' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {usuario.estado}
              </span>
            </div>
            
            <div className="text-sm text-gray-700 mb-4 space-y-1">
              <p><span className="font-semibold">Usuario:</span> {usuario.usuario}</p>
              <p><span className="font-semibold">Email:</span> {usuario.email}</p>
              <p><span className="font-semibold">Rol:</span> <span className="capitalize">{usuario.rol}</span></p>
              <p><span className="font-semibold">Última conexión:</span> {formatDate(usuario.ultimaConexion)}</p>
              {usuario.observaciones && (
                <p><span className="font-semibold">Observaciones:</span> {usuario.observaciones}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-3">
              <button 
                onClick={() => handleToggleStatus(usuario)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={usuario.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
              >
                {usuario.estado === 'Activo' ? <FaUserSlash className="text-red-500" /> : <FaUserCheck className="text-green-500" />}
              </button>
              <button 
                onClick={() => handleEdit(usuario)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Editar usuario"
              >
                <FaEdit className="text-blue-500" />
              </button>
              <button 
                onClick={() => handleDelete(usuario.id)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Eliminar usuario"
              >
                <FaTrash className="text-red-500" />
              </button>
            </div>
          </div>
        ))}

        {usuarios.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg shadow-md p-6">
            No se encontraron usuarios. {searchQuery ? 'Intente con otra búsqueda.' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
