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
    <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center text-gray-800">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-center text-gray-800">
        {semirremolque ? "Editar semirremolque" : "Agregar semirremolque"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 md:gap-16 w-full max-w-4xl"
      >
        {/* Nombre */}
        <div className="flex flex-col mb-4">
          <label htmlFor="nombre" className="font-medium mb-1 text-gray-700">Nombre/Tipo:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ej: Cisterna para GLP"
            required
          />
        </div>

        {/* Dominio (Patente) */}
        <div className="flex flex-col mb-4">
          <label htmlFor="dominio" className="font-medium mb-1 text-gray-700">Dominio (Patente):</label>
          <input
            type="text"
            id="dominio"
            name="dominio"
            value={formData.dominio}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Año */}
        <div className="flex flex-col mb-4">
          <label htmlFor="año" className="font-medium mb-1 text-gray-700">Año:</label>
          <input
            type="number"
            id="año"
            name="año"
            value={formData.año}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black focus:ring-2 focus:ring-primary focus:border-transparent"
            min="1990"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col">
          <label htmlFor="estado">Estado:</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            required
          >
            <option value="Disponible">Disponible</option>
            <option value="En uso">En uso</option>
            <option value="En reparación">En reparación</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
          </select>
        </div>

        {/* Tipo de Servicio */}
        <div className="flex flex-col">
          <label htmlFor="tipoServicio">Tipo de Servicio:</label>
          <input
            type="text"
            id="tipoServicio"
            name="tipoServicio"
            value={formData.tipoServicio}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            placeholder="Ej: Transporte de combustibles líquidos, GLP, metanol"
            required
          />
        </div>

        {/* Alcance del Servicio */}
        <div className="flex flex-col">
          <label htmlFor="alcanceServicio">Alcance del Servicio:</label>
          <select
            id="alcanceServicio"
            name="alcanceServicio"
            value={formData.alcanceServicio}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            required
          >
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
          </select>
        </div>

        {/* Vencimiento RTO */}
        <div className="flex flex-col">
          <label htmlFor="vencimientoRTO">Vencimiento RTO:</label>
          <input
            type="date"
            id="vencimientoRTO"
            name="vencimientoRTO"
            value={formData.vencimientoRTO}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            required
          />
        </div>

        {/* Vencimiento Visual Externa */}
        <div className="flex flex-col">
          <label htmlFor="vencimientoVisualExterna">Vencimiento Visual Externa:</label>
          <input
            type="date"
            id="vencimientoVisualExterna"
            name="vencimientoVisualExterna"
            value={formData.vencimientoVisualExterna}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
          />
        </div>

        {/* Vencimiento Visual Interna */}
        <div className="flex flex-col">
          <label htmlFor="vencimientoVisualInterna">Vencimiento Visual Interna:</label>
          <input
            type="date"
            id="vencimientoVisualInterna"
            name="vencimientoVisualInterna"
            value={formData.vencimientoVisualInterna}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
          />
        </div>

        {/* Vencimiento Espesores */}
        <div className="flex flex-col">
          <label htmlFor="vencimientoEspesores">Vencimiento Espesores:</label>
          <input
            type="date"
            id="vencimientoEspesores"
            name="vencimientoEspesores"
            value={formData.vencimientoEspesores}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
          />
        </div>

        {/* Vencimiento Prueba Hidráulica */}
        <div className="flex flex-col">
          <label htmlFor="vencimientoPruebaHidraulica">Vencimiento Prueba Hidráulica:</label>
          <input
            type="date"
            id="vencimientoPruebaHidraulica"
            name="vencimientoPruebaHidraulica"
            value={formData.vencimientoPruebaHidraulica}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
          />
        </div>

        {/* Vencimiento Mangueras */}
        <div className="flex flex-col">
          <label htmlFor="vencimientoMangueras">Vencimiento Mangueras:</label>
          <input
            type="date"
            id="vencimientoMangueras"
            name="vencimientoMangueras"
            value={formData.vencimientoMangueras}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
          />
        </div>

        {/* Vencimiento Válvula Flujo */}
        <div className="flex flex-col">
          <label htmlFor="vencimientoValvulaFlujo">Vencimiento Válvula Flujo:</label>
          <input
            type="date"
            id="vencimientoValvulaFlujo"
            name="vencimientoValvulaFlujo"
            value={formData.vencimientoValvulaFlujo}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
          />
        </div>

        {/* Observaciones */}
        <div className="flex flex-col col-span-1 sm:col-span-2 mb-6">
          <label htmlFor="observaciones" className="font-medium mb-1 text-gray-700">Observaciones:</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Notas técnicas o condiciones especiales"
            rows={3}
          />
        </div>

        {/* Botones */}
        <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 w-full sm:w-auto"
          >
            {semirremolque ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 w-full sm:w-auto"
            onClick={() => navigate("/semirremolques")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}