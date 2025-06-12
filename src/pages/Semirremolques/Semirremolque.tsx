import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSemirremolquesStore } from "@/stores";
import { useServiciosStore } from "@/stores/serviciosStore";
import { Semirremolque as SemirremolqueType } from "@/utils/supabase";
import { toast } from "react-toastify";
import ConfirmModal from '@/components/ConfirmModal';

export default function Semirremolque() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    selectedSemirremolque: semirremolque, 
    fetchSemirremolqueById, 
    addSemirremolque, 
    editSemirremolque,
    removeSemirremolque,
    isLoading,
    error,
    clearError
  } = useSemirremolquesStore();
  
  const { servicios, fetchServicios } = useServiciosStore();
  
  useEffect(() => {
    if (id) {
      fetchSemirremolqueById(id);
    }
    
    // Cargar la lista de servicios disponibles
    fetchServicios();
  }, [id, fetchSemirremolqueById, fetchServicios]);

  // Actualizar el formulario cuando se carga un semirremolque existente
  useEffect(() => {
    if (semirremolque) {
      setFormData({
        nombre: semirremolque.nombre || "",
        dominio: semirremolque.dominio || "",
        año: semirremolque.año || new Date().getFullYear(),
        estado: semirremolque.estado || "Disponible",
        tipo_servicio: semirremolque.tipo_servicio || "",
        alcance_servicio: semirremolque.alcance_servicio || false,
        vencimiento_rto: semirremolque.vencimiento_rto || "",
        vencimiento_visual_ext: semirremolque.vencimiento_visual_ext || "",
        vencimiento_visual_int: semirremolque.vencimiento_visual_int || "",
        vencimiento_espesores: semirremolque.vencimiento_espesores || "",
        vencimiento_prueba_hidraulica: semirremolque.vencimiento_prueba_hidraulica || "",
        vencimiento_mangueras: semirremolque.vencimiento_mangueras || "",
        vencimiento_valvula_five: semirremolque.vencimiento_valvula_five || "",
      });
    }
  }, [semirremolque]);

  const [formData, setFormData] = useState({
    nombre: "",
    dominio: "",
    año: new Date().getFullYear(),
    estado: "Disponible",
    tipo_servicio: "",
    alcance_servicio: false,
    vencimiento_rto: "",
    vencimiento_visual_ext: "",
    vencimiento_visual_int: "",
    vencimiento_espesores: "",
    vencimiento_prueba_hidraulica: "",
    vencimiento_mangueras: "",
    vencimiento_valvula_five: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === "alcance_servicio") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (semirremolque && id) {
        await editSemirremolque(id, formData);
        toast.success("Semirremolque actualizado correctamente");
      } else {
        await addSemirremolque(formData as unknown as Omit<SemirremolqueType, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>);
        toast.success("Semirremolque agregado correctamente");
      }
      navigate("/semirremolques");
    } catch (err) {
      console.error("Error al guardar el semirremolque:", err);
      toast.error("Error al guardar el semirremolque");
    }
  };
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await removeSemirremolque(id);
      toast.success('Semirremolque eliminado correctamente');
      setShowDeleteModal(false);
      navigate('/semirremolques');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el semirremolque');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              className="absolute top-0 right-0 px-4 py-3" 
              onClick={clearError}
            >
              <span className="text-red-500">&times;</span>
            </button>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {semirremolque ? "Editar semirremolque" : "Agregar semirremolque"}
            </h1>
            {semirremolque && id && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => handleSubmit(e)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nombre">Nombre/Tipo:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Ej: Cisterna para GLP"
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
                <option value="En uso">En uso</option>
                <option value="En reparación">En reparación</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="alcance_servicio">Alcance del Servicio:</label>
              <select
                id="alcance_servicio"
                name="alcance_servicio"
                value={formData.alcance_servicio.toString()}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              >
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
              </select>
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

            {/* Vencimiento Visual Externa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimiento_visual_ext">Vencimiento Visual Externa:</label>
              <input
                type="date"
                id="vencimiento_visual_ext"
                name="vencimiento_visual_ext"
                value={formData.vencimiento_visual_ext}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Visual Interna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimiento_visual_int">Vencimiento Visual Interna:</label>
              <input
                type="date"
                id="vencimiento_visual_int"
                name="vencimiento_visual_int"
                value={formData.vencimiento_visual_int}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Espesores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimiento_espesores">Vencimiento Espesores:</label>
              <input
                type="date"
                id="vencimiento_espesores"
                name="vencimiento_espesores"
                value={formData.vencimiento_espesores}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Prueba Hidráulica */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimiento_prueba_hidraulica">Vencimiento Prueba Hidráulica:</label>
              <input
                type="date"
                id="vencimiento_prueba_hidraulica"
                name="vencimiento_prueba_hidraulica"
                value={formData.vencimiento_prueba_hidraulica}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Mangueras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimiento_mangueras">Vencimiento Mangueras:</label>
              <input
                type="date"
                id="vencimiento_mangueras"
                name="vencimiento_mangueras"
                value={formData.vencimiento_mangueras}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Válvula Flujo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimiento_valvula_five">Vencimiento Válvula Five:</label>
              <input
                type="date"
                id="vencimiento_valvula_five"
                name="vencimiento_valvula_five"
                value={formData.vencimiento_valvula_five}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>

          {/* No incluimos observaciones ya que no existe en el tipo Semirremolque de Supabase */}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/semirremolques")}
              className="px-5 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {semirremolque ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este semirremolque? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}