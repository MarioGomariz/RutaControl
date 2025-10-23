import { useEffect, useState } from 'react';
import { useEstadisticasStore } from '@/stores';
import { useChoferesStore, useTractoresStore, useSemirremolquesStore, useServiciosStore } from '@/stores';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  FaChartBar, FaFilter, FaDownload, FaTruck, FaUsers, 
  FaRoute, FaCalendarAlt, FaClock 
} from 'react-icons/fa';
import type { FiltrosEstadisticas } from '@/types/estadisticas';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Estadisticas() {
  const { estadisticas, isLoading, error, fetchEstadisticas, clearError } = useEstadisticasStore();
  const { choferes, fetchChoferes } = useChoferesStore();
  const { tractores, fetchTractores } = useTractoresStore();
  const { semirremolques, fetchSemirremolques } = useSemirremolquesStore();
  const { servicios, fetchServicios } = useServiciosStore();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosEstadisticas>({});

  useEffect(() => {
    fetchEstadisticas();
    fetchChoferes();
    fetchTractores();
    fetchSemirremolques();
    fetchServicios();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFiltroChange = (campo: keyof FiltrosEstadisticas, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor || undefined
    }));
  };

  const aplicarFiltros = () => {
    fetchEstadisticas(filtros);
    setMostrarFiltros(false);
    toast.success('Filtros aplicados');
  };

  const limpiarFiltros = () => {
    setFiltros({});
    fetchEstadisticas({});
    toast.info('Filtros limpiados');
  };

  const exportarPDF = () => {
    if (!estadisticas) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADÍSTICAS DEL SISTEMA', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Fecha de generación
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Estadísticas Generales
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estadísticas Generales', 14, yPosition);
    yPosition += 8;

    const datosGenerales = [
      ['Total de Viajes', estadisticas.generales.total_viajes.toString()],
      ['Viajes Programados', estadisticas.generales.viajes_programados.toString()],
      ['Viajes en Curso', estadisticas.generales.viajes_en_curso.toString()],
      ['Viajes Finalizados', estadisticas.generales.viajes_finalizados.toString()],
      ['Kilómetros Totales', `${estadisticas.generales.total_km_recorridos.toFixed(2)} km`],
      ['Promedio km/Viaje', `${estadisticas.generales.promedio_km_por_viaje.toFixed(2)} km`],
      ['Choferes Activos', estadisticas.generales.total_choferes_activos.toString()],
      ['Tractores Disponibles', estadisticas.generales.total_tractores_disponibles.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: datosGenerales,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Top 5 Choferes
    if (estadisticas.viajes_por_chofer.length > 0) {
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Choferes por Viajes', 14, yPosition);
      yPosition += 8;

      const datosChoferes = estadisticas.viajes_por_chofer.slice(0, 5).map(c => [
        `${c.chofer_nombre} ${c.chofer_apellido}`,
        c.total_viajes.toString(),
        c.viajes_finalizados.toString(),
        `${c.total_km.toFixed(2)} km`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Chofer', 'Total Viajes', 'Finalizados', 'Km Recorridos']],
        body: datosChoferes,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 14, right: 14 }
      });
    }

    doc.save(`estadisticas-${new Date().getTime()}.pdf`);
    toast.success('PDF exportado exitosamente');
  };

  if (isLoading && !estadisticas) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const { generales } = estadisticas;

  // Preparar datos para gráficos
  const datosEstadosViaje = [
    { name: 'Programados', value: generales.viajes_programados, color: '#FFBB28' },
    { name: 'En Curso', value: generales.viajes_en_curso, color: '#00C49F' },
    { name: 'Finalizados', value: generales.viajes_finalizados, color: '#0088FE' },
  ];

  const datosKmPorUnidad = estadisticas.kilometros_por_unidad.slice(0, 10).map(item => ({
    name: `${item.tractor_marca} ${item.tractor_modelo}`,
    km: item.total_km,
    viajes: item.cantidad_viajes
  }));

  const datosViajesPorChofer = estadisticas.viajes_por_chofer.slice(0, 10).map(item => ({
    name: `${item.chofer_nombre} ${item.chofer_apellido}`,
    total: item.total_viajes,
    finalizados: item.viajes_finalizados,
    en_curso: item.viajes_en_curso
  }));

  const datosViajesPorMes = estadisticas.viajes_por_mes.map(item => ({
    mes: item.mes,
    viajes: item.total_viajes,
    km: item.total_km
  }));

  const hayDatos = generales.total_viajes > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaChartBar className="text-primary" />
              Estadísticas del Sistema
            </h1>
            <p className="text-gray-600 mt-2">
              Análisis y métricas del uso de la flota
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaFilter /> Filtros
            </button>
            <button
              onClick={exportarPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Panel de Filtros */}
        {mostrarFiltros && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Filtros Personalizables</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chofer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chofer
                </label>
                <select
                  value={filtros.chofer_id || ''}
                  onChange={(e) => handleFiltroChange('chofer_id', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos</option>
                  {choferes.filter(c => c.activo).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tractor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tractor
                </label>
                <select
                  value={filtros.tractor_id || ''}
                  onChange={(e) => handleFiltroChange('tractor_id', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos</option>
                  {tractores.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.marca} {t.modelo} - {t.dominio}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio
                </label>
                <select
                  value={filtros.servicio_id || ''}
                  onChange={(e) => handleFiltroChange('servicio_id', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filtros.fecha_inicio || ''}
                  onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filtros.fecha_fin || ''}
                  onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Alcance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alcance
                </label>
                <select
                  value={filtros.alcance || ''}
                  onChange={(e) => handleFiltroChange('alcance', e.target.value as 'nacional' | 'internacional' | undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos</option>
                  <option value="nacional">Nacional</option>
                  <option value="internacional">Internacional</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={aplicarFiltros}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={limpiarFiltros}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {!hayDatos ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No hay datos suficientes para mostrar estadísticas con los filtros seleccionados.
                Intenta ampliar el rango de fechas o modificar los criterios de búsqueda.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cards de Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Viajes</p>
                  <p className="text-3xl font-bold text-gray-800">{generales.total_viajes}</p>
                </div>
                <FaRoute className="text-4xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Km Recorridos</p>
                  <p className="text-3xl font-bold text-gray-800">{generales.total_km_recorridos.toFixed(0)}</p>
                </div>
                <FaTruck className="text-4xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Choferes Activos</p>
                  <p className="text-3xl font-bold text-gray-800">{generales.total_choferes_activos}</p>
                </div>
                <FaUsers className="text-4xl text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Promedio km/Viaje</p>
                  <p className="text-3xl font-bold text-gray-800">{generales.promedio_km_por_viaje.toFixed(0)}</p>
                </div>
                <FaCalendarAlt className="text-4xl text-orange-500" />
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Estados de Viaje */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Distribución de Viajes por Estado</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosEstadosViaje}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosEstadosViaje.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Viajes por Mes */}
            {datosViajesPorMes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Viajes por Mes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={datosViajesPorMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="viajes" stroke="#0088FE" name="Viajes" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Gráfico de Kilómetros por Unidad */}
          {datosKmPorUnidad.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-bold mb-4">Top 10 Tractores por Kilómetros Recorridos</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosKmPorUnidad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="km" fill="#0088FE" name="Kilómetros" />
                  <Bar dataKey="viajes" fill="#00C49F" name="Viajes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Viajes por Chofer */}
          {datosViajesPorChofer.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-bold mb-4">Top 10 Choferes por Cantidad de Viajes</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosViajesPorChofer}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884D8" name="Total Viajes" />
                  <Bar dataKey="finalizados" fill="#82CA9D" name="Finalizados" />
                  <Bar dataKey="en_curso" fill="#FFC658" name="En Curso" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabla de Inactividad de Vehículos */}
          {estadisticas.inactividad_vehiculos.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaClock className="text-orange-500" />
                Inactividad de Vehículos
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tractor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Viaje
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Días Inactivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estadisticas.inactividad_vehiculos.slice(0, 10).map((item, index) => (
                      <tr key={index} className={item.dias_inactivo > 30 ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.tractor_marca} {item.tractor_modelo} - {item.tractor_dominio}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.ultimo_viaje ? new Date(item.ultimo_viaje).toLocaleDateString('es-ES') : 'Sin viajes'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded ${item.dias_inactivo > 30 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {item.dias_inactivo} días
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.estado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
