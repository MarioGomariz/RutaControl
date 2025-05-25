import { createTractor, getTractorById, updateTractor } from "@/utils/tractores";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Tractor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tractor = getTractorById(id || "");

  const [formData, setFormData] = useState({
    marca: tractor?.marca || "",
    modelo: tractor?.modelo || "",
    dominio: tractor?.dominio || "",
    año: tractor?.año || new Date().getFullYear(),
    vencimientoRTO: tractor?.vencimientoRTO || "",
    estado: tractor?.estado || "Disponible",
    tipoServicio: tractor?.tipoServicio || "",
    alcanceServicio: tractor?.alcanceServicio || "Nacional",
    observaciones: tractor?.observaciones || "",
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
    if (tractor) {
      updateTractor(id || "", formData);
    } else {
      createTractor(formData);
    }
    navigate("/tractores");
  };

  return (
    <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
      <h1 className="text-2xl font-bold mb-10 text-gray-800">
        {tractor ? "Editar tractor" : "Agregar tractor"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-20 w-full max-w-4xl"
      >
        {/* Marca */}
        <div className="flex flex-col">
          <label htmlFor="marca">Marca:</label>
          <input
            type="text"
            id="marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            required
          />
        </div>

        {/* Modelo */}
        <div className="flex flex-col">
          <label htmlFor="modelo">Modelo:</label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
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
            <option value="En reparación">En reparación</option>
            <option value="En viaje">En viaje</option>
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

        {/* Observaciones */}
        <div className="flex flex-col col-span-2">
          <label htmlFor="observaciones">Observaciones:</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            rows={3}
          />
        </div>

        {/* Botones */}
        <button
          type="button"
          className="bg-red-500 text-background-0 p-2 rounded-lg cursor-pointer"
          onClick={() => navigate("/tractores")}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-primary text-background-0 p-2 rounded-lg cursor-pointer"
        >
          {tractor ? "Editar" : "Agregar"}
        </button>
      </form>
    </div>
  );
}