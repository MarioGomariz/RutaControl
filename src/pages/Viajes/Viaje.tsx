import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useViajesStore } from "@/stores/viajesStore";
import { useChoferesStore } from "@/stores/choferesStore";
import { useTractoresStore } from "@/stores/tractoresStore";
import { useSemirremolquesStore } from "@/stores/semirremolquesStore";
import { useServiciosStore } from "@/stores/serviciosStore";
import type { Viaje as ViajeType, EstadoViaje } from "@/types/viaje";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import { FaArrowLeft, FaTruck, FaRoute, FaTrash, FaSave, FaMapMarked, FaMapMarkerAlt, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import { 
  FormSection, 
  FormField, 
  FormInput, 
  FormSelect, 
  FormButton 
} from "@/components/FormComponents";
import { getDaysUntilExpiration, getRequiredDocFields } from "@/utils/semirremolqueDocumentation";
import { toDateInput } from '@/helpers/dateFormater';

export default function Viaje() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedViaje, 
    isLoading: isLoadingViaje, 
    error: viajeError, 
    fetchViajeById, 
    addViaje, 
    editViaje, 
    removeViaje,
    clearSelectedViaje 
  } = useViajesStore();

  const { choferes, fetchChoferes } = useChoferesStore();
  const { tractores, fetchTractores } = useTractoresStore();
  const { semirremolques, fetchSemirremolques } = useSemirremolquesStore();
  const { servicios, fetchServicios } = useServiciosStore();

  const isEditing = id !== 'new';
  const parsedId = isEditing && id ? Number(id) : null;

  useEffect(() => {
    // Cargar datos necesarios
    fetchChoferes();
    fetchTractores();
    fetchSemirremolques();
    fetchServicios();

    if (isEditing && parsedId !== null && !Number.isNaN(parsedId)) {
      fetchViajeById(parsedId);
    }
    return () => clearSelectedViaje();
  }, [parsedId, isEditing, fetchViajeById, clearSelectedViaje, fetchChoferes, fetchTractores, fetchSemirremolques, fetchServicios]);

  interface ViajeForm extends Omit<ViajeType, 'id'> {}
  
  interface DestinoForm {
    orden: number;
    ubicacion: string;
  }

  const [formData, setFormData] = useState<ViajeForm>({
    chofer_id: 0,
    tractor_id: 0,
    semirremolque_id: 0,
    servicio_id: 0,
    alcance: 'nacional',
    origen: "",
    cantidad_destinos: 1,
    fecha_hora_salida: "",
    estado: "programado" as EstadoViaje,
  });
  
  const [destinos, setDestinos] = useState<DestinoForm[]>([
    { orden: 1, ubicacion: "" }
  ]);

  useEffect(() => {
    if (selectedViaje) {
      setFormData({
        chofer_id: selectedViaje.chofer_id,
        tractor_id: selectedViaje.tractor_id,
        semirremolque_id: selectedViaje.semirremolque_id,
        servicio_id: selectedViaje.servicio_id,
        alcance: selectedViaje.alcance,
        origen: selectedViaje.origen,
        cantidad_destinos: selectedViaje.cantidad_destinos,
        fecha_hora_salida: toDateInput(selectedViaje.fecha_hora_salida),
        estado: selectedViaje.estado,
      });
      
      // Cargar destinos si existen
      if ((selectedViaje as any).destinos && Array.isArray((selectedViaje as any).destinos)) {
        const destinosCargados = (selectedViaje as any).destinos.map((d: any) => ({
          orden: d.orden,
          ubicacion: d.ubicacion
        }));
        setDestinos(destinosCargados.length > 0 ? destinosCargados : [{ orden: 1, ubicacion: "" }]);
      }
    }
  }, [selectedViaje]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const numericFields = new Set([
      'chofer_id',
      'tractor_id',
      'semirremolque_id',
      'servicio_id',
      'cantidad_destinos',
    ]);
    
    const numericValue = value === "" ? 0 : Number(value);
    
    // Si se selecciona un tractor, auto-setear el servicio según el tractor
    if (name === 'tractor_id' && numericValue > 0) {
      const tractor = tractores.find(t => t.id === numericValue);
      if (tractor?.tipo_servicio) {
        const servicio = servicios.find(s => s.nombre.toLowerCase() === tractor.tipo_servicio?.toLowerCase());
        if (servicio) {
          setFormData((prev) => ({
            ...prev,
            tractor_id: numericValue,
            servicio_id: servicio.id,
            // Limpiar semirremolque si no coincide con el servicio
            semirremolque_id: prev.semirremolque_id > 0 ? (() => {
              const semi = semirremolques.find(s => s.id === prev.semirremolque_id);
              return semi?.tipo_servicio?.toLowerCase() === tractor.tipo_servicio?.toLowerCase() ? prev.semirremolque_id : 0;
            })() : 0
          }));
          return;
        }
      }
    }
    
    // Si se selecciona un semirremolque, auto-setear el servicio según el semirremolque
    if (name === 'semirremolque_id' && numericValue > 0) {
      const semi = semirremolques.find(s => s.id === numericValue);
      if (semi?.tipo_servicio) {
        const servicio = servicios.find(s => s.nombre.toLowerCase() === semi.tipo_servicio?.toLowerCase());
        if (servicio) {
          setFormData((prev) => ({
            ...prev,
            semirremolque_id: numericValue,
            servicio_id: servicio.id,
            // Limpiar tractor si no coincide con el servicio
            tractor_id: prev.tractor_id > 0 ? (() => {
              const trac = tractores.find(t => t.id === prev.tractor_id);
              return trac?.tipo_servicio?.toLowerCase() === semi.tipo_servicio?.toLowerCase() ? prev.tractor_id : 0;
            })() : 0
          }));
          return;
        }
      }
    }
    
    // Si se cambia el servicio, limpiar tractor y semirremolque
    if (name === 'servicio_id') {
      setFormData((prev) => ({
        ...prev,
        servicio_id: numericValue,
        tractor_id: 0,
        semirremolque_id: 0
      }));
      return;
    }
    
    // Para campos numéricos
    if (type === "number" || numericFields.has(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const [error, setError] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expiredErrors, setExpiredErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Verificar documentación vencida o próxima a vencer comparando con la fecha de salida
  useEffect(() => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];
    
    // Si no hay fecha de salida, no validar
    if (!formData.fecha_hora_salida) {
      setExpiredErrors([]);
      setWarnings([]);
      return;
    }
    
    // Fecha de salida del viaje
    const fechaSalida = new Date(formData.fecha_hora_salida);
    fechaSalida.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    // Función helper para calcular días hasta vencimiento desde la fecha de salida
    const getDaysUntilExpirationFromDate = (expirationDate: string, fromDate: Date): number | null => {
      const expDate = new Date(expirationDate);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - fromDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };
    
    // Verificar chofer
    if (formData.chofer_id > 0) {
      const chofer = choferes.find(c => c.id === formData.chofer_id);
      if (chofer?.fecha_vencimiento_licencia) {
        const days = getDaysUntilExpirationFromDate(chofer.fecha_vencimiento_licencia, fechaSalida);
        if (days !== null) {
          if (days < 0) {
            newErrors.push(`❌ CHOFER: La licencia estará VENCIDA en la fecha de salida`);
          } else if (days === 0) {
            newWarnings.push(`⚠️ CHOFER: La licencia vence el mismo día de salida`);
          } else if (days <= 7) {
            newWarnings.push(`⚠️ CHOFER: La licencia vence ${days === 1 ? '1 día después' : `${days} días después`} de la salida`);
          }
        }
      }
    }
    
    // Verificar tractor
    if (formData.tractor_id > 0) {
      const tractor = tractores.find(t => t.id === formData.tractor_id);
      if (tractor?.vencimiento_rto) {
        const days = getDaysUntilExpirationFromDate(tractor.vencimiento_rto, fechaSalida);
        if (days !== null) {
          if (days < 0) {
            newErrors.push(`❌ TRACTOR: El RTO estará VENCIDO en la fecha de salida`);
          } else if (days === 0) {
            newWarnings.push(`⚠️ TRACTOR: El RTO vence el mismo día de salida`);
          } else if (days <= 7) {
            newWarnings.push(`⚠️ TRACTOR: El RTO vence ${days === 1 ? '1 día después' : `${days} días después`} de la salida`);
          }
        }
      }
    }
    
    // Verificar semirremolque
    if (formData.semirremolque_id > 0) {
      const semi = semirremolques.find(s => s.id === formData.semirremolque_id);
      if (semi?.tipo_servicio) {
        const requiredFields = getRequiredDocFields(semi.tipo_servicio);
        const fieldLabels: Record<string, string> = {
          'vencimiento_rto': 'RTO',
          'vencimiento_visual_externa': 'Visual Externa',
          'vencimiento_visual_interna': 'Visual Interna',
          'vencimiento_espesores': 'Espesores',
          'vencimiento_mangueras': 'Mangueras',
          'vencimiento_prueba_hidraulica': 'Prueba Hidráulica',
          'vencimiento_valvula_flujo': 'Válvula de Flujo',
        };
        
        requiredFields.forEach(field => {
          const dateValue = (semi as any)[field];
          if (dateValue) {
            const days = getDaysUntilExpirationFromDate(dateValue, fechaSalida);
            if (days !== null) {
              const label = fieldLabels[field] || field;
              if (days < 0) {
                newErrors.push(`❌ SEMIRREMOLQUE: ${label} estará VENCIDO en la fecha de salida`);
              } else if (days === 0) {
                newWarnings.push(`⚠️ SEMIRREMOLQUE: ${label} vence el mismo día de salida`);
              } else if (days <= 7) {
                newWarnings.push(`⚠️ SEMIRREMOLQUE: ${label} vence ${days === 1 ? '1 día después' : `${days} días después`} de la salida`);
              }
            }
          }
        });
      }
    }
    
    setExpiredErrors(newErrors);
    setWarnings(newWarnings);
  }, [formData.chofer_id, formData.tractor_id, formData.semirremolque_id, formData.fecha_hora_salida, choferes, tractores, semirremolques]);
  
  // Funciones para manejar destinos
  const agregarDestino = () => {
    setDestinos([...destinos, { orden: destinos.length + 1, ubicacion: "" }]);
  };
  
  const eliminarDestino = (index: number) => {
    if (destinos.length > 1) {
      const nuevosDestinos = destinos.filter((_, i) => i !== index);
      // Reordenar
      const reordenados = nuevosDestinos.map((d, i) => ({ ...d, orden: i + 1 }));
      setDestinos(reordenados);
    }
  };
  
  const actualizarDestino = (index: number, ubicacion: string) => {
    const nuevosDestinos = [...destinos];
    nuevosDestinos[index].ubicacion = ubicacion;
    setDestinos(nuevosDestinos);
  };

  const handleDelete = async () => {
    if (parsedId === null) return;
    
    try {
      await removeViaje(parsedId);
      toast.success("Viaje eliminado correctamente");
      setShowDeleteModal(false);
      navigate("/viajes");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el viaje");
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Bloquear si el viaje está finalizado
    if (isEditing && selectedViaje?.estado === 'finalizado') {
      toast.error('No se puede modificar un viaje finalizado');
      return;
    }
    setError('');

    try {
      // Verificar documentación vencida
      if (expiredErrors.length > 0) {
        toast.error('No se puede crear el viaje con documentación vencida');
        setError('No se puede crear el viaje porque hay documentación vencida. Por favor, actualice los documentos antes de continuar.');
        return;
      }

      // Validaciones básicas
      if (!formData.origen.trim()) {
        toast.error('El origen es obligatorio');
        return;
      }
      if (!formData.fecha_hora_salida) {
        toast.error('La fecha de salida es obligatoria');
        return;
      }
      if (!formData.chofer_id || formData.chofer_id <= 0) {
        toast.error('Debes seleccionar un chofer');
        return;
      }
      if (!formData.tractor_id || formData.tractor_id <= 0) {
        toast.error('Debes seleccionar un tractor');
        return;
      }
      if (!formData.semirremolque_id || formData.semirremolque_id <= 0) {
        toast.error('Debes seleccionar un semirremolque');
        return;
      }
      if (!formData.servicio_id || formData.servicio_id <= 0) {
        toast.error('Debes seleccionar un servicio');
        return;
      }
      
      // Validar destinos
      if (destinos.length === 0) {
        toast.error('Debe haber al menos un destino');
        return;
      }
      
      const destinosVacios = destinos.filter(d => !d.ubicacion.trim());
      if (destinosVacios.length > 0) {
        toast.error('Todos los destinos deben tener una ubicación');
        return;
      }

      // Preparar datos con destinos
      const viajeData = {
        ...formData,
        cantidad_destinos: destinos.length,
        destinos: destinos.map(d => ({ orden: d.orden, ubicacion: d.ubicacion }))
      };

      if (isEditing && parsedId !== null) {
        await editViaje(parsedId, viajeData as any);
        toast.success("Viaje actualizado correctamente");
        navigate("/viajes");
      } else {
        await addViaje(viajeData as any);
        toast.success("Viaje creado correctamente");
        navigate("/viajes");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al guardar el viaje');
      toast.error('No se pudo guardar el viaje');
    }
  };

  // Separar choferes por disponibilidad
  const choferesDisponibles = choferes.filter(chofer => {
    // Disponible: activo, no en viaje, sin licencia vencida
    if (chofer.estado !== 'disponible') return false;
    if (chofer.fecha_vencimiento_licencia) {
      const days = getDaysUntilExpiration(chofer.fecha_vencimiento_licencia);
      if (days !== null && days < 0) return false;
    }
    return true;
  });
  
  // Choferes con licencia vencida (activos pero no disponibles)
  const choferesConLicenciaVencida = choferes.filter(chofer => {
    if (!chofer.activo || chofer.estado === 'inactivo') return false;
    if (chofer.fecha_vencimiento_licencia) {
      const days = getDaysUntilExpiration(chofer.fecha_vencimiento_licencia);
      return days !== null && days < 0;
    }
    return false;
  });
  
  // Choferes inactivos
  const choferesInactivos = choferes.filter(chofer => chofer.estado === 'inactivo');

  // Filtrar tractores disponibles (estado + vencimientos + servicio)
  const tractoresConEstado = tractores
    .filter(tractor => {
      // Si hay servicio seleccionado, filtrar por tipo_servicio
      if (formData.servicio_id > 0) {
        const servicioSeleccionado = servicios.find(s => s.id === formData.servicio_id);
        if (servicioSeleccionado && tractor.tipo_servicio) {
          return tractor.tipo_servicio.toLowerCase() === servicioSeleccionado.nombre.toLowerCase();
        }
        // Si el tractor no tiene tipo_servicio asignado, no mostrarlo cuando hay servicio seleccionado
        return !servicioSeleccionado;
      }
      return true;
    })
    .map(tractor => {
    let disponible = tractor.estado === 'disponible';
    let motivoNoDisponible = '';
    
    // Verificar estado físico
    if (tractor.estado !== 'disponible') {
      disponible = false;
      const mensajes: Record<string, string> = {
        'en viaje': 'En viaje',
        'en reparacion': 'En reparación',
        'fuera de servicio': 'Fuera de servicio'
      };
      motivoNoDisponible = mensajes[tractor.estado] || 'No disponible';
    }
    
    // Verificar vencimiento RTO
    if (disponible && tractor.vencimiento_rto) {
      const days = getDaysUntilExpiration(tractor.vencimiento_rto);
      if (days !== null && days < 0) {
        disponible = false;
        motivoNoDisponible = 'RTO vencido';
      }
    }
    
    return {
      ...tractor,
      disponible,
      motivoNoDisponible
    };
  });

  // Filtrar semirremolques disponibles (estado + vencimientos + servicio)
  const semirremolquesConEstado = semirremolques
    .filter(semirremolque => {
      // Si hay servicio seleccionado, filtrar por tipo_servicio
      if (formData.servicio_id > 0) {
        const servicioSeleccionado = servicios.find(s => s.id === formData.servicio_id);
        if (servicioSeleccionado && semirremolque.tipo_servicio) {
          return semirremolque.tipo_servicio.toLowerCase() === servicioSeleccionado.nombre.toLowerCase();
        }
        // Si el semirremolque no tiene tipo_servicio asignado, no mostrarlo cuando hay servicio seleccionado
        return !servicioSeleccionado;
      }
      return true;
    })
    .map(semirremolque => {
    let disponible = semirremolque.estado === 'disponible';
    let motivoNoDisponible = '';
    
    // Verificar estado físico
    if (semirremolque.estado !== 'disponible') {
      disponible = false;
      const mensajes: Record<string, string> = {
        'en viaje': 'En viaje',
        'en reparacion': 'En reparación',
        'fuera de servicio': 'Fuera de servicio'
      };
      motivoNoDisponible = mensajes[semirremolque.estado] || 'No disponible';
    }
    
    // Verificar vencimientos según tipo de servicio
    if (disponible && semirremolque.tipo_servicio) {
      const requiredFields = getRequiredDocFields(semirremolque.tipo_servicio);
      for (const field of requiredFields) {
        const vencimiento = (semirremolque as any)[field];
        if (vencimiento) {
          const days = getDaysUntilExpiration(vencimiento);
          if (days !== null && days < 0) {
            disponible = false;
            const fieldLabels: Record<string, string> = {
              'vencimiento_rto': 'RTO',
              'vencimiento_visual_externa': 'Visual Externa',
              'vencimiento_visual_interna': 'Visual Interna',
              'vencimiento_espesores': 'Espesores',
              'vencimiento_prueba_hidraulica': 'Prueba Hidráulica',
              'vencimiento_mangueras': 'Mangueras',
              'vencimiento_valvula_flujo': 'Válvula de Flujo'
            };
            motivoNoDisponible = `${fieldLabels[field] || field} vencido`;
            break;
          }
        }
      }
    }
    
    return {
      ...semirremolque,
      disponible,
      motivoNoDisponible
    };
  });
  
  // Obtener estado del tractor seleccionado
  const tractorSeleccionado = tractores.find(t => t.id === formData.tractor_id);
  const [tractorWarning, setTractorWarning] = useState<string>('');
  
  useEffect(() => {
    if (tractorSeleccionado && tractorSeleccionado.estado !== 'disponible') {
      const mensajes: Record<string, string> = {
        'en viaje': 'ℹ️ Este tractor está en viaje (puede asignarlo si las fechas no se superponen)',
        'en reparacion': '⚠️ Este tractor está en reparación',
        'fuera de servicio': '⚠️ Este tractor está fuera de servicio'
      };
      setTractorWarning(mensajes[tractorSeleccionado.estado] || '');
    } else {
      setTractorWarning('');
    }
  }, [tractorSeleccionado]);

  // Detectar si el viaje está finalizado
  const isViajeFinalizado = isEditing && selectedViaje?.estado === 'finalizado';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link to="/viajes" className="flex items-center text-primary hover:text-blue-700 transition-colors mr-4">
            <FaArrowLeft className="mr-2" />
            <span>Volver a viajes</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex-1">
            {isEditing ? (isViajeFinalizado ? "Ver viaje (Finalizado)" : "Editar viaje") : "Crear nuevo viaje"}
          </h1>
          {isEditing && !isViajeFinalizado && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-200"
            >
              <FaTrash className="mr-2" />
              Eliminar
            </button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">

        {isViajeFinalizado && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">🔒 Este viaje está finalizado y no puede ser modificado ni eliminado.</span>
            </div>
          </div>
        )}

        {(error || viajeError) && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error || viajeError}</span>
            </div>
          </div>
        )}

        {expiredErrors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <div className="flex items-start">
              <FaExclamationTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold mb-2">⛔ No se puede crear el viaje - Documentación vencida:</h3>
                <ul className="space-y-1">
                  {expiredErrors.map((error, index) => (
                    <li key={index} className="text-sm font-medium">
                      {error}
                    </li>
                  ))}
                </ul>
                <p className="text-sm mt-3 font-medium">
                  Debe actualizar la documentación vencida antes de poder crear el viaje.
                </p>
              </div>
            </div>
          </div>
        )}

        {warnings.length > 0 && expiredErrors.length === 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 rounded mb-6">
            <div className="flex items-start">
              <FaExclamationTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Advertencias - Documentación próxima a vencer:</h3>
                <ul className="space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm">
                      {warning}
                    </li>
                  ))}
                </ul>
                <p className="text-sm mt-3 italic">
                  Puede crear el viaje, pero considere actualizar esta documentación pronto.
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoadingViaje ? (
          <div className="flex justify-center items-center py-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-3"></div>
              <p className="text-gray-500 font-medium">Cargando datos del viaje...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection 
              title="Información del vehículo y conductor" 
              icon={<FaTruck />} 
              color="blue"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chofer */}
                <FormField label="Chofer" name="chofer_id" required>
                  <FormSelect
                    name="chofer_id"
                    value={formData.chofer_id}
                    onChange={handleChange}
                    required
                    disabled={isViajeFinalizado}
                  >
                    <option value="">Seleccionar chofer</option>
                    {choferesDisponibles.map(chofer => (
                      <option key={chofer.id} value={chofer.id}>
                        {chofer.nombre} {chofer.apellido}
                      </option>
                    ))}
                    {choferesConLicenciaVencida.map(chofer => (
                      <option key={chofer.id} value={chofer.id} disabled>
                        {chofer.nombre} {chofer.apellido} - ❌ Licencia vencida
                      </option>
                    ))}
                    {choferesInactivos.map(chofer => (
                      <option key={chofer.id} value={chofer.id} disabled>
                        {chofer.nombre} {chofer.apellido} - 🚫 Inactivo
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                {/* Tractor */}
                <FormField label="Tractor" name="tractor_id" required>
                  <FormSelect
                    name="tractor_id"
                    value={formData.tractor_id}
                    onChange={handleChange}
                    required
                    disabled={isViajeFinalizado}
                  >
                    <option value="">Seleccionar tractor</option>
                    {tractoresConEstado.filter(t => t.disponible).map(tractor => (
                      <option key={tractor.id} value={tractor.id}>
                        {tractor.marca} {tractor.modelo} - {tractor.dominio} ✓ Disponible
                      </option>
                    ))}
                    {tractoresConEstado.filter(t => !t.disponible).map(tractor => (
                      <option key={tractor.id} value={tractor.id} disabled>
                        {tractor.marca} {tractor.modelo} - {tractor.dominio} - ❌ {tractor.motivoNoDisponible}
                      </option>
                    ))}
                  </FormSelect>
                  {tractorWarning && (
                    <div className={`mt-2 text-sm rounded p-2 ${
                      tractorWarning.includes('ℹ️') 
                        ? 'text-blue-700 bg-blue-50 border border-blue-200' 
                        : 'text-amber-700 bg-amber-50 border border-amber-200'
                    }`}>
                      {tractorWarning}
                    </div>
                  )}
                </FormField>

                {/* Semirremolque */}
                <FormField label="Semirremolque" name="semirremolque_id" required>
                  <FormSelect
                    name="semirremolque_id"
                    value={formData.semirremolque_id}
                    onChange={handleChange}
                    required
                    disabled={isViajeFinalizado}
                  >
                    <option value="">Seleccionar semirremolque</option>
                    {semirremolquesConEstado.filter(s => s.disponible).map(semirremolque => (
                      <option key={semirremolque.id} value={semirremolque.id}>
                        {semirremolque.nombre} - {semirremolque.dominio} ✓ Disponible
                      </option>
                    ))}
                    {semirremolquesConEstado.filter(s => !s.disponible).map(semirremolque => (
                      <option key={semirremolque.id} value={semirremolque.id} disabled>
                        {semirremolque.nombre} - {semirremolque.dominio} - ❌ {semirremolque.motivoNoDisponible}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

              </div>
            </FormSection>

            <FormSection
              title="Información del servicio y ruta" 
              icon={<FaRoute />} 
              color="green"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Servicio */}
                <FormField label="Servicio" name="servicio_id" required>
                  <FormSelect
                    name="servicio_id"
                    value={formData.servicio_id}
                    onChange={handleChange}
                    required
                    disabled={isViajeFinalizado}
                  >
                    <option value={0}>Seleccionar servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                {/* Alcance */}
                <FormField label="Alcance" name="alcance" required>
                  <FormSelect
                    name="alcance"
                    value={formData.alcance}
                    onChange={handleChange}
                    required
                    disabled={isViajeFinalizado}
                  >
                    <option value="nacional">Nacional</option>
                    <option value="internacional">Internacional</option>
                  </FormSelect>
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Origen y fecha"
              icon={<FaMapMarked />}
              color="amber"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Origen */}
                <FormField label="Origen" name="origen" required>
                  <FormInput
                    type="text"
                    name="origen"
                    value={formData.origen}
                    onChange={handleChange}
                    placeholder="Ciudad o ubicación de origen"
                    required
                    disabled={isViajeFinalizado}
                  />
                </FormField>

                {/* Fecha de salida */}
                <FormField label="Fecha de salida" name="fecha_hora_salida" required>
                  <FormInput
                    type="date"
                    name="fecha_hora_salida"
                    value={formData.fecha_hora_salida}
                    onChange={handleChange}
                    required
                    disabled={isViajeFinalizado}
                  />
                </FormField>
              </div>
            </FormSection>
            
            <FormSection
              title="Destinos del viaje"
              icon={<FaMapMarkerAlt />}
              color="indigo"
            >
              <div className="space-y-4">
                {destinos.map((destino, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destino {index + 1}
                      </label>
                      <input
                        type="text"
                        value={destino.ubicacion}
                        onChange={(e) => actualizarDestino(index, e.target.value)}
                        placeholder="Ubicación del destino"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    {destinos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarDestino(index)}
                        className="mt-8 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
                        title="Eliminar destino"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={agregarDestino}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaPlus /> Agregar destino
                </button>
                
                <p className="text-sm text-gray-600 mt-2">
                  Total de destinos: <strong>{destinos.length}</strong>
                </p>
              </div>
            </FormSection>

            {/* ========================================
                SECCIÓN DE ESTADO - DESHABILITADA
                ========================================
                Esta sección permite editar manualmente el estado del viaje.
                Se ha deshabilitado porque los estados deben cambiar automáticamente:
                - "programado" → "en curso" al iniciar el viaje
                - "en curso" → "finalizado" al finalizar el viaje
                
                Si necesitas reactivar la edición manual de estado, descomenta el código siguiente:
            */}
            {/* {isEditing && (
              <FormSection
                title="Estado"
                icon={<FaClipboardList />}
                color="purple"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <FormField label="Estado del viaje" name="estado" required>
                    <FormSelect
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      required
                      disabled={isViajeFinalizado}
                    >
                      <option value="programado">Programado</option>
                      <option value="en curso">En curso</option>
                      <option value="finalizado">Finalizado</option>
                    </FormSelect>
                  </FormField>
                </div>
              </FormSection>
            )} */}
            
            <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
              <FormButton
                type="button"
                onClick={() => navigate("/viajes")}
                variant="secondary"
              >
                Cancelar
              </FormButton>
              {isEditing && !isViajeFinalizado && (
                <FormButton
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  icon={<FaTrash />}
                >
                  Eliminar
                </FormButton>
              )}
              {!isViajeFinalizado && (
                <FormButton
                  type="submit"
                  variant="primary"
                  icon={<FaSave />}
                >
                  {isEditing ? 'Guardar cambios' : 'Crear viaje'}
                </FormButton>
              )}
            </div>
          </form>
        )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmar eliminación"
        message="¿Está seguro que desea eliminar este viaje? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}