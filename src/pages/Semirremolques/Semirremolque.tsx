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
    <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
      <h1 className="text-2xl font-bold mb-10 text-gray-800">
        {semirremolque ? "Editar semirremolque" : "Agregar semirremolque"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-20 w-full max-w-4xl"
      >
        {/* Nombre */}
        <div className="flex flex-col">
          <label htmlFor="nombre">Nombre/Tipo:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            placeholder="Ej: Cisterna para GLP"
            required
          />
        </div>

        {/* Dominio (Patente) */}
        <div className="flex flex-col">
          <label htmlFor="dominio">Dominio (Patente):</label>
          <input
            type="text"
            id="dominio"
            name="dominio"
            value={formData.dominio}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            required
          />
        </div>

        {/* Año */}
        <div className="flex flex-col">
          <label htmlFor="año">Año:</label>
          <input
            type="number"
            id="año"
            name="año"
            value={formData.año}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
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
        <div className="flex flex-col col-span-2">
          <label htmlFor="observaciones">Observaciones:</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            placeholder="Notas técnicas o condiciones especiales"
            rows={3}
          />
        </div>

        {/* Botones */}
        <button
          type="button"
          className="bg-red-500 text-background-0 p-2 rounded-lg cursor-pointer"
          onClick={() => navigate("/semirremolques")}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-primary text-background-0 p-2 rounded-lg cursor-pointer"
        >
          {semirremolque ? "Editar" : "Agregar"}
        </button>
      </form>
    </div>
  );
}