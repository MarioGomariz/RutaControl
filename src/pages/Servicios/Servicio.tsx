import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServiciosStore } from "@/stores/serviciosStore";
import { toast } from "react-toastify";

export default function Servicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedServicio, 
    isLoading, 
    error, 
    fetchServicioById, 
    addServicio, 
    editServicio, 
    removeServicio,
    clearSelectedServicio 
  } = useServiciosStore();
  
  const isEditing = id !== 'new';

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    requiere_prueba_hidraulica: false,
    requiere_visuales: false,
    requiere_valvula_y_mangueras: false,
    observaciones: "",
  });
  
  useEffect(() => {
    if (isEditing && id) {
      fetchServicioById(id);
    }
    
    return () => clearSelectedServicio();
  }, [id, isEditing, fetchServicioById, clearSelectedServicio]);
  
  useEffect(() => {
    if (selectedServicio) {
      setFormData({
        nombre: selectedServicio.nombre,
        descripcion: selectedServicio.descripcion,
        requiere_prueba_hidraulica: selectedServicio.requiere_prueba_hidraulica,
        requiere_visuales: selectedServicio.requiere_visuales,
        requiere_valvula_y_mangueras: selectedServicio.requiere_valvula_y_mangueras,
        observaciones: selectedServicio.observaciones || "",
      });
    }
  }, [selectedServicio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (isEditing && id) {
        await editServicio(id, formData);
        toast.success('Servicio actualizado correctamente');
      } else {
        await addServicio(formData as any);
        toast.success('Servicio creado correctamente');
      }
      navigate("/servicios");
    } catch (err: any) {
      // El error ya se maneja en el store
      console.error(err);
      toast.error('Error al guardar el servicio');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer.')) {
      try {
        await removeServicio(id);
        toast.success('Servicio eliminado correctamente');
        navigate('/servicios');
      } catch (err) {
        console.error(err);
        toast.error('Error al eliminar el servicio');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar servicio" : "Agregar servicio"}
          </h1>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading && !selectedServicio && isEditing ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Nombre del servicio"
                required
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="descripcion">Descripción:</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Descripción detallada del servicio"
                rows={3}
                required
              />
            </div>

            {/* Requerimientos */}
            <div className="md:col-span-2">
              <h3 className="text-md font-medium text-gray-700 mb-3">Requerimientos del servicio:</h3>
              <div className="space-y-3">
                {/* Prueba Hidráulica */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiere_prueba_hidraulica"
                    name="requiere_prueba_hidraulica"
                    checked={formData.requiere_prueba_hidraulica}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="requierePruebaHidraulica">
                    Requiere prueba hidráulica
                  </label>
                </div>
                
                {/* Visuales */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiere_visuales"
                    name="requiere_visuales"
                    checked={formData.requiere_visuales}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="requiereVisuales">
                    Requiere visuales
                  </label>
                </div>
                
                {/* Válvula y Mangueras */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiere_valvula_y_mangueras"
                    name="requiere_valvula_y_mangueras"
                    checked={formData.requiere_valvula_y_mangueras}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="requiereValvulaYMangueras">
                    Requiere válvula y mangueras
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="observaciones">Observaciones:</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/servicios")}
              className="px-5 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isEditing ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}