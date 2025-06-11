import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServiciosStore } from "@/stores/serviciosStore";

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
    clearSelectedServicio 
  } = useServiciosStore();
  
  const isEditing = id !== 'new';

  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: "",
    estado: "pendiente" as 'pendiente' | 'en_curso' | 'completado' | 'cancelado',
    chofer_id: "",
    tractor_id: "",
    semirremolque_id: "",
    numero_remito: "",
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
        origen: selectedServicio.origen,
        destino: selectedServicio.destino,
        fecha_inicio: selectedServicio.fecha_inicio.split('T')[0],
        fecha_fin: selectedServicio.fecha_fin ? selectedServicio.fecha_fin.split('T')[0] : "",
        estado: selectedServicio.estado,
        chofer_id: selectedServicio.chofer_id,
        tractor_id: selectedServicio.tractor_id,
        semirremolque_id: selectedServicio.semirremolque_id,
        numero_remito: selectedServicio.numero_remito || "",
        observaciones: selectedServicio.observaciones || "",
      });
    }
  }, [selectedServicio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (isEditing && id) {
        await editServicio(id, formData);
      } else {
        await addServicio(formData as any);
      }
      navigate("/servicios");
    } catch (err: any) {
      // El error ya se maneja en el store
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar servicio" : "Agregar servicio"}
          </h1>
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
            {/* Origen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="origen">Origen:</label>
              <input
                type="text"
                id="origen"
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Ciudad o lugar de origen"
                required
              />
            </div>

            {/* Destino */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="destino">Destino:</label>
              <input
                type="text"
                id="destino"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Ciudad o lugar de destino"
                required
              />
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="fecha_inicio">Fecha de inicio:</label>
              <input
                type="date"
                id="fecha_inicio"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="fecha_fin">Fecha de finalización:</label>
              <input
                type="date"
                id="fecha_fin"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                <option value="pendiente">Pendiente</option>
                <option value="en_curso">En curso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Chofer ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="chofer_id">Chofer:</label>
              <input
                type="text"
                id="chofer_id"
                name="chofer_id"
                value={formData.chofer_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>

            {/* Tractor ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tractor_id">Tractor:</label>
              <input
                type="text"
                id="tractor_id"
                name="tractor_id"
                value={formData.tractor_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>

            {/* Semirremolque ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="semirremolque_id">Semirremolque:</label>
              <input
                type="text"
                id="semirremolque_id"
                name="semirremolque_id"
                value={formData.semirremolque_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>

            {/* Número de Remito */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="numero_remito">Número de Remito:</label>
              <input
                type="text"
                id="numero_remito"
                name="numero_remito"
                value={formData.numero_remito}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
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