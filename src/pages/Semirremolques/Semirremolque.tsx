import { createSemirremolque, getSemirremolqueById, updateSemirremolque } from "@/utils/semirremolques";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Semirremolque() {
  const { id } = useParams();
  const navigate = useNavigate();
  const semirremolque = getSemirremolqueById(id || "");

  const [formData, setFormData] = useState({
    nombre: semirremolque?.nombre || "",
    dominio: semirremolque?.dominio || "",
    año: semirremolque?.año || new Date().getFullYear(),
    estado: semirremolque?.estado || "Disponible",
    tipoServicio: semirremolque?.tipoServicio || "",
    alcanceServicio: semirremolque?.alcanceServicio || "Nacional",
    vencimientoRTO: semirremolque?.vencimientoRTO || "",
    vencimientoVisualExterna: semirremolque?.vencimientoVisualExterna || "",
    vencimientoVisualInterna: semirremolque?.vencimientoVisualInterna || "",
    vencimientoEspesores: semirremolque?.vencimientoEspesores || "",
    vencimientoPruebaHidraulica: semirremolque?.vencimientoPruebaHidraulica || "",
    vencimientoMangueras: semirremolque?.vencimientoMangueras || "",
    vencimientoValvulaFlujo: semirremolque?.vencimientoValvulaFlujo || "",
    observaciones: semirremolque?.observaciones || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (semirremolque) {
      updateSemirremolque(id || "", formData);
    } else {
      createSemirremolque(formData);
    }
    navigate("/semirremolques");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {semirremolque ? "Editar semirremolque" : "Agregar semirremolque"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
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
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tipoServicio">Tipo de Servicio:</label>
              <input
                type="text"
                id="tipoServicio"
                name="tipoServicio"
                value={formData.tipoServicio}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Ej: Transporte de combustibles líquidos, GLP, metanol"
                required
              />
            </div>

            {/* Alcance del Servicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="alcanceServicio">Alcance del Servicio:</label>
              <select
                id="alcanceServicio"
                name="alcanceServicio"
                value={formData.alcanceServicio}
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
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimientoRTO">Vencimiento RTO:</label>
              <input
                type="date"
                id="vencimientoRTO"
                name="vencimientoRTO"
                value={formData.vencimientoRTO}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>

            {/* Vencimiento Visual Externa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimientoVisualExterna">Vencimiento Visual Externa:</label>
              <input
                type="date"
                id="vencimientoVisualExterna"
                name="vencimientoVisualExterna"
                value={formData.vencimientoVisualExterna}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Visual Interna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimientoVisualInterna">Vencimiento Visual Interna:</label>
              <input
                type="date"
                id="vencimientoVisualInterna"
                name="vencimientoVisualInterna"
                value={formData.vencimientoVisualInterna}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Espesores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimientoEspesores">Vencimiento Espesores:</label>
              <input
                type="date"
                id="vencimientoEspesores"
                name="vencimientoEspesores"
                value={formData.vencimientoEspesores}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Prueba Hidráulica */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimientoPruebaHidraulica">Vencimiento Prueba Hidráulica:</label>
              <input
                type="date"
                id="vencimientoPruebaHidraulica"
                name="vencimientoPruebaHidraulica"
                value={formData.vencimientoPruebaHidraulica}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Mangueras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimientoMangueras">Vencimiento Mangueras:</label>
              <input
                type="date"
                id="vencimientoMangueras"
                name="vencimientoMangueras"
                value={formData.vencimientoMangueras}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Vencimiento Válvula Flujo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vencimientoValvulaFlujo">Vencimiento Válvula Flujo:</label>
              <input
                type="date"
                id="vencimientoValvulaFlujo"
                name="vencimientoValvulaFlujo"
                value={formData.vencimientoValvulaFlujo}
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
              placeholder="Notas técnicas o condiciones especiales"
              rows={3}
            />
          </div>

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
    </div>
  );
}