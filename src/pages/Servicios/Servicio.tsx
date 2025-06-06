import { createServicio, getServicioById, updateServicio } from "@/utils/servicios";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Servicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const servicio = getServicioById(id || "");

  const [formData, setFormData] = useState({
    nombre: servicio?.nombre || "",
    descripcion: servicio?.descripcion || "",
    requierePruebaHidraulica: servicio?.requierePruebaHidraulica || false,
    requiereVisuales: servicio?.requiereVisuales || false,
    requiereValvulaYMangueras: servicio?.requiereValvulaYMangueras || false,
    observaciones: servicio?.observaciones || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (servicio) {
      updateServicio(id || "", formData);
    } else {
      createServicio(formData);
    }
    navigate("/servicios");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {servicio ? "Editar servicio" : "Agregar servicio"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nombre">Nombre del servicio:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            placeholder="Ej: Transporte de combustibles líquidos, GLP, metanol"
            required
          />
            </div>

            {/* Descripción */}
            <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="descripcion">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            placeholder="Detalle del servicio si se desea ampliar"
            rows={3}
          />
            </div>

            {/* Requiere Prueba Hidráulica */}
            <div>
              <div className="flex items-center">
            <input
              type="checkbox"
              id="requierePruebaHidraulica"
              name="requierePruebaHidraulica"
              checked={formData.requierePruebaHidraulica}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requierePruebaHidraulica" className="ml-2 block text-sm font-medium text-gray-700">Requiere prueba hidráulica</label>
              </div>
            </div>

            {/* Requiere Visuales */}
            <div>
              <div className="flex items-center">
            <input
              type="checkbox"
              id="requiereVisuales"
              name="requiereVisuales"
              checked={formData.requiereVisuales}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiereVisuales" className="ml-2 block text-sm font-medium text-gray-700">Requiere inspecciones visuales</label>
              </div>
            </div>

            {/* Requiere Válvula y Mangueras */}
            <div>
              <div className="flex items-center">
            <input
              type="checkbox"
              id="requiereValvulaYMangueras"
              name="requiereValvulaYMangueras"
              checked={formData.requiereValvulaYMangueras}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiereValvulaYMangueras" className="ml-2 block text-sm font-medium text-gray-700">Requiere control de válvulas y mangueras</label>
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
            placeholder="Comentarios técnicos o administrativos adicionales"
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
          >
            {servicio ? "Editar" : "Agregar"}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}