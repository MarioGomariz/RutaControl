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
    <div className="mx-auto p-4 flex flex-col items-center justify-center text-gray-800">
      <h1 className="text-2xl font-bold mb-10 text-gray-800">
        {servicio ? "Editar servicio" : "Agregar servicio"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-20 w-full max-w-4xl"
      >
        {/* Nombre */}
        <div className="flex flex-col">
          <label htmlFor="nombre">Nombre del servicio:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            placeholder="Ej: Transporte de combustibles líquidos, GLP, metanol"
            required
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col">
          <label htmlFor="descripcion">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg p-2 text-black"
            placeholder="Detalle del servicio si se desea ampliar"
            rows={3}
          />
        </div>

        {/* Requiere Prueba Hidráulica */}
        <div className="flex items-center">
          <label htmlFor="requierePruebaHidraulica" className="mr-10">Requiere prueba hidráulica:</label>
          <input
            type="checkbox"
            id="requierePruebaHidraulica"
            name="requierePruebaHidraulica"
            checked={formData.requierePruebaHidraulica}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg size-6"
          />
        </div>

        {/* Requiere Visuales */}
        <div className="flex items-center">
          <label htmlFor="requiereVisuales" className="mr-10">Requiere inspecciones visuales:</label>
          <input
            type="checkbox"
            id="requiereVisuales"
            name="requiereVisuales"
            checked={formData.requiereVisuales}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg size-6"
          />
        </div>

        {/* Requiere Válvula y Mangueras */}
        <div className="flex items-center">
          <label htmlFor="requiereValvulaYMangueras" className="mr-10">Requiere control de válvulas y mangueras:</label>
          <input
            type="checkbox"
            id="requiereValvulaYMangueras"
            name="requiereValvulaYMangueras"
            checked={formData.requiereValvulaYMangueras}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg size-6"
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
            placeholder="Comentarios técnicos o administrativos adicionales"
            rows={3}
          />
        </div>

        {/* Botones */}
        <button
          type="button"
          className="bg-red-500 text-background-0 p-2 rounded-lg cursor-pointer"
          onClick={() => navigate("/servicios")}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-primary text-background-0 p-2 rounded-lg cursor-pointer"
        >
          {servicio ? "Editar" : "Agregar"}
        </button>
      </form>
    </div>
  );
}