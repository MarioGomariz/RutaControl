import { createChofer, getChoferById, updateChofer } from "@/utils/choferes";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Chofer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chofer = getChoferById(id || "");

  const [formData, setFormData] = useState({
    nombre: chofer?.nombre || "",
    apellido: chofer?.apellido || "",
    dni: chofer?.dni || "",
    telefono: chofer?.telefono || "",
    email: chofer?.email || "",
    licencia: chofer?.licencia || "",
    fechaVencimientoLicencia: chofer?.fechaVencimientoLicencia || "",
    activo: chofer?.activo || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chofer) {
      updateChofer(id || "", formData);
    } else {
      createChofer(formData);
    }
    navigate("/choferes");
  };

  return (
    <div className="mx-auto p-4 flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl font-bold mb-10 ">
        {chofer ? "Editar chofer" : "Agregar chofer"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-20"
      >
        {/* Inputs dinámicos */}
        {[
          { label: "Nombre", name: "nombre", type: "text" },
          { label: "Apellido", name: "apellido", type: "text" },
          { label: "DNI", name: "dni", type: "text" },
          { label: "Teléfono", name: "telefono", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Licencia", name: "licencia", type: "text" },
          { label: "Fecha de vencimiento de licencia", name: "fechaVencimientoLicencia", type: "date" },
        ].map(({ label, name, type }) => (
          <div className="flex flex-col" key={name}>
            <label htmlFor={name}>{label}:</label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name as keyof typeof formData] as string}
              onChange={handleChange}
              className="border border-gray-500 rounded-lg p-2"
            />
          </div>
        ))}

        {/* Checkbox activo */}
        <div>
          <label htmlFor="activo" className="mr-10">Activo:</label>
          <input
            type="checkbox"
            id="activo"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            className="border border-gray-500 rounded-lg size-6"
          />
        </div>

        {/* Botones */}
        <button
          type="button"
          className="bg-red-500 text-background-0 p-2 rounded-lg cursor-pointer"
          onClick={() => navigate("/choferes")}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-primary text-background-0 p-2 rounded-lg cursor-pointer"
        >
          {chofer ? "Editar" : "Agregar"}
        </button>
      </form>
    </div>
  );
}
