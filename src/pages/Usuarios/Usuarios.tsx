import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaUserSlash, FaUserCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUsuariosStore } from '@/stores/usuariosStore';
import ConfirmModal from '@/components/ConfirmModal';
import { User } from '@/utils/supabase';

const Usuarios: React.FC = () => {
  const { 
    usuarios, 
    isLoading, 
    error, 
    fetchUsuarios, 
    searchUsuario, 
    removeUsuario, 
    cambiarEstado 
  } = useUsuariosStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Buscar usuarios cuando cambia la consulta
  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsuario(searchQuery);
    } else {
      fetchUsuarios();
    }
  }, [searchQuery, searchUsuario, fetchUsuarios]);

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // La búsqueda se maneja en el useEffect
  };

  // Abrir formulario para editar
  const handleEdit = (usuario: User) => {
    navigate(`/usuario/${usuario.id}`);
  };

  // Manejar eliminación de usuario
  const handleDelete = async (id: string) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación de usuario
  const confirmDelete = async () => {
    if (userToDelete) {
      await removeUsuario(userToDelete);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Manejar cambio de estado de usuario
  const handleToggleStatus = async (usuario: User) => {
    const nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';
    await cambiarEstado(usuario.id, nuevoEstado as 'Activo' | 'Inactivo' | 'Suspendido');
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
              <p className="text-sm text-gray-600">Usuario: {usuario.usuario}</p>
              <p className="text-sm text-gray-600">Email: {usuario.email}</p>
              <p className="text-sm text-gray-600">Rol: {usuario.rol_id === 1 ? 'Administrador' : 'Chofer'}</p>
              <p className="text-sm text-gray-600">Última conexión: {formatDate(usuario.ultima_conexion)}</p>
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
      )}
      
      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este usuario?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Eliminar"
      />
    </div>
  );
};

export default Usuarios;
