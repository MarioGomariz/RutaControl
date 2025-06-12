import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTractoresStore } from "@/stores/tractoresStore";
import { useServiciosStore } from "@/stores/serviciosStore";
import { toast } from "react-toastify";

export default function Tractor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedTractor, 
    isLoading, 
    error, 
    fetchTractorById, 
    addTractor, 
    editTractor, 
    removeTractor,
    clearSelectedTractor 
  } = useTractoresStore();
  
  const { servicios, fetchServicios } = useServiciosStore();
  
  const isEditing = id !== 'new';

  useEffect(() => {
    if (isEditing && id) {
      fetchTractorById(id);
    }
    
    // Cargar la lista de servicios disponibles
    fetchServicios();
    
    return () => clearSelectedTractor();
  }, [id, isEditing, fetchTractorById, fetchServicios, clearSelectedTractor]);

  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    dominio: "",
    año: new Date().getFullYear(),
    vencimiento_rto: "",
    estado: "Disponible",
    tipo_servicio: "",
    alcance_servicio: false,
  });
  
  useEffect(() => {
    if (selectedTractor) {
      setFormData({
        marca: selectedTractor.marca,
        modelo: selectedTractor.modelo,
        dominio: selectedTractor.dominio,
        año: selectedTractor.año,
        vencimiento_rto: selectedTractor.vencimiento_rto,
        estado: selectedTractor.estado,
        tipo_servicio: selectedTractor.tipo_servicio,
        alcance_servicio: selectedTractor.alcance_servicio,
      });
    }
  }, [selectedTractor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
              type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (isEditing && id) {
        await editTractor(id, formData);
        toast.success("Tractor actualizado correctamente");
      } else {
        await addTractor(formData);
        toast.success("Tractor agregado correctamente");
      }
      navigate("/tractores");
    } catch (err: any) {
      // El error ya se maneja en el store
      console.error(err);
      toast.error("Error al guardar el tractor");
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('¿Está seguro de que desea eliminar este tractor? Esta acción no se puede deshacer.')) {
      try {
        await removeTractor(id);
        toast.success('Tractor eliminado correctamente');
        navigate('/tractores');
      } catch (err) {
        console.error(err);
        toast.error('Error al eliminar el tractor');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar tractor" : "Agregar tractor"}
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

        {isLoading && !selectedTractor && isEditing ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="marca">Marca:</label>
          <input
            type="text"
            id="marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
          />
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="modelo">Modelo:</label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
          />
        </div>

        {/* Dominio (Patente) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dominio">Dominio (Patente):</label>
          <input
            type="text"
            id="dominio"
            name="dominio"
            value={formData.dominio}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
          />
        </div>

        {/* Año */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="año">Año:</label>
          <input
            type="number"
            id="año"
            name="año"
            value={formData.año}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            min="1990"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        {/* Vencimiento RTO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimiento_rto">Vencimiento RTO:</label>
          <input
            type="date"
            id="vencimiento_rto"
            name="vencimiento_rto"
            value={formData.vencimiento_rto}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="estado">Estado:</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
          >
            <option value="Disponible">Disponible</option>
            <option value="En reparación">En reparación</option>
            <option value="En viaje">En viaje</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
          </select>
        </div>

        {/* Tipo de Servicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tipo_servicio">Tipo de Servicio:</label>
          <select
            id="tipo_servicio"
            name="tipo_servicio"
            value={formData.tipo_servicio}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
          >
            <option value="">Seleccione un servicio</option>
            {servicios.map((servicio) => (
              <option key={servicio.id} value={servicio.nombre}>
                {servicio.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Alcance del Servicio */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="alcance_servicio"
            name="alcance_servicio"
            checked={formData.alcance_servicio}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-700" htmlFor="alcance_servicio">
            Alcance Internacional
          </label>
        </div>

          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/tractores")}
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