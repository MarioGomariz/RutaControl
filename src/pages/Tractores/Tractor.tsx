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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {tractor ? "Editar tractor" : "Agregar tractor"}
          </h1>
        </div>

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
              onClick={() => navigate("/tractores")}
              className="px-5 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {tractor ? "Editar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}