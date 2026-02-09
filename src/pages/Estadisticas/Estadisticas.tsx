import { useEffect, useState } from 'react';
import { useEstadisticasStore } from '@/stores';
import { useChoferesStore, useTractoresStore, useSemirremolquesStore, useServiciosStore } from '@/stores';
import { obtenerViajesDetalladosPorChofer } from '@/services/estadisticasService';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  FaChartBar, FaFilter, FaDownload, FaTruck, FaUsers, 
  FaRoute, FaClock, FaTruckMoving, FaUserTie, FaChartLine,
  FaTachometerAlt, FaCheckCircle
} from 'react-icons/fa';
import type { FiltrosEstadisticas } from '@/types/estadisticas';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, formatDateTime } from '@/utils/formatDate';

type TabType = 'general' | 'unidades' | 'choferes' | 'rendimiento';

export default function Estadisticas() {
  const { estadisticas, isLoading, error, fetchEstadisticas, clearError } = useEstadisticasStore();
  const { choferes, fetchChoferes } = useChoferesStore();
  const { tractores, fetchTractores } = useTractoresStore();
  const { fetchSemirremolques } = useSemirremolquesStore();
  const { servicios, fetchServicios } = useServiciosStore();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosEstadisticas>({});
  const [tabActiva, setTabActiva] = useState<TabType>('general');

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

  const exportarPDF = async () => {
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
    doc.text(`Generado: ${formatDateTime(new Date().toISOString())}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Si hay un chofer seleccionado, generar PDF detallado
    if (filtros.chofer_id) {
      try {
        const choferSeleccionado = choferes.find(c => c.id === filtros.chofer_id);
        const nombreChofer = choferSeleccionado 
          ? `${choferSeleccionado.nombre} ${choferSeleccionado.apellido}`
          : 'Chofer';

        // Obtener viajes detallados
        const viajesDetallados = await obtenerViajesDetalladosPorChofer(
          filtros.chofer_id,
          { fecha_inicio: filtros.fecha_inicio, fecha_fin: filtros.fecha_fin }
        );

        // Obtener el dominio del tractor (del primer viaje si hay)
        const dominioTractor = viajesDetallados.length > 0 ? viajesDetallados[0].tractor_dominio : '';

        // Título del chofer con dominio del camión
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Viajes Detallados - ${nombreChofer} - ${dominioTractor}`, 14, yPosition);
        yPosition += 10;

        if (viajesDetallados.length === 0) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text('No hay viajes registrados para este chofer en el período seleccionado.', 14, yPosition);
        } else {
          // Función para obtener el día de la semana en español
          const obtenerDiaSemana = (fecha: Date): string => {
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return dias[fecha.getDay()];
          };

          // Preparar datos para la tabla
          const datosViajes = viajesDetallados.map(tramo => {
            const fechaSalida = new Date(tramo.fecha_salida);
            const fechaLlegada = tramo.fecha_llegada ? new Date(tramo.fecha_llegada) : null;

            return [
              obtenerDiaSemana(fechaSalida),
              formatDate(tramo.fecha_salida),
              tramo.origen || '-',
              fechaLlegada ? obtenerDiaSemana(fechaLlegada) : '-',
              fechaLlegada ? formatDate(tramo.fecha_llegada) : '-',
              tramo.destino || '-',
              tramo.km_comunes.toFixed(2),
              tramo.km_100x100.toFixed(2)
            ];
          });

          // Tabla con viajes detallados
          autoTable(doc, {
            startY: yPosition,
            head: [[
              'Día Salida',
              'Fecha Salida',
              'Sale De',
              'Día Llegada',
              'Fecha Llegada',
              'Llega a',
              'Km Comunes',
              'Km 100x100'
            ]],
            body: datosViajes,
            theme: 'striped',
            headStyles: { 
              fillColor: [66, 139, 202],
              fontSize: 8,
              halign: 'center'
            },
            bodyStyles: {
              fontSize: 7
            },
            columnStyles: {
              0: { cellWidth: 20 },
              1: { cellWidth: 22 },
              2: { cellWidth: 25 },
              3: { cellWidth: 20 },
              4: { cellWidth: 22 },
              5: { cellWidth: 25 },
              6: { cellWidth: 20, halign: 'right' },
              7: { cellWidth: 20, halign: 'right' }
            },
            margin: { left: 14, right: 14 }
          });

          // Totales
          yPosition = (doc as any).lastAutoTable.finalY + 10;
          const totalKmComunes = viajesDetallados.reduce((sum, v) => sum + v.km_comunes, 0);
          const totalKm100x100 = viajesDetallados.reduce((sum, v) => sum + v.km_100x100, 0);
          const totalKm = totalKmComunes + totalKm100x100;

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Resumen de Kilómetros:', 14, yPosition);
          yPosition += 8;

          const datosTotales = [
            ['Total Kilómetros Comunes', `${totalKmComunes.toFixed(2)} km`],
            ['Total Kilómetros 100x100', `${totalKm100x100.toFixed(2)} km`],
            ['Total General', `${totalKm.toFixed(2)} km`],
            ['Cantidad de Tramos', viajesDetallados.length.toString()]
          ];

          autoTable(doc, {
            startY: yPosition,
            head: [],
            body: datosTotales,
            theme: 'plain',
            styles: { fontSize: 10, fontStyle: 'bold' },
            margin: { left: 14, right: 14 }
          });
        }
      } catch (error) {
        console.error('Error al obtener viajes detallados:', error);
        toast.error('Error al generar PDF detallado');
        return;
      }
    } else {
      // PDF general (sin chofer seleccionado)
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
    { name: 'Programados', value: Number(generales.viajes_programados) || 0, color: '#F59E0B' },
    { name: 'En Curso', value: Number(generales.viajes_en_curso) || 0, color: '#3B82F6' },
    { name: 'Finalizados', value: Number(generales.viajes_finalizados) || 0, color: '#10B981' },
  ].filter(item => item.value > 0);

  const datosKmPorUnidad = estadisticas.kilometros_por_unidad.slice(0, 10).map(item => ({
    name: `${item.tractor_marca} ${item.tractor_modelo}`,
    km: item.total_km,
    viajes: item.cantidad_viajes
  }));

  const datosViajesPorChofer = estadisticas.viajes_por_chofer.slice(0, 10).map(item => ({
    name: `${item.chofer_nombre} ${item.chofer_apellido}`,
    total: item.total_viajes,
    programados: item.viajes_programados,
    en_curso: item.viajes_en_curso,
    finalizados: item.viajes_finalizados
  }));

  const datosViajesPorMes = estadisticas.viajes_por_mes.map(item => ({
    mes: item.mes,
    viajes: item.total_viajes,
    km: item.total_km
  }));

  const hayDatos = generales.total_viajes > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Mejorado */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <FaChartLine className="text-white text-2xl" />
              </div>
              Panel de Estadísticas
            </h1>
            <p className="text-gray-600 mt-2 ml-1">
              Análisis integral del uso de la flota y rendimiento operativo
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all shadow-sm ${
                mostrarFiltros 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaFilter /> Filtros
            </button>
            <button
              onClick={exportarPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-all shadow-sm"
            >
              <FaDownload /> Exportar
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
                  {choferes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} {!c.activo ? '(Inactivo)' : ''}
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
        <div>
          {/* Cards de Estadísticas Generales Mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Viajes */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <FaRoute className="text-5xl opacity-90" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Viajes</p>
                  <p className="text-4xl font-bold">{generales.total_viajes}</p>
                  <p className="text-blue-100 text-xs mt-2">Todos los estados</p>
                </div>
              </div>
            </div>

            {/* Estados de Viajes - Combinado */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaChartBar className="text-2xl text-gray-700" />
                <h3 className="text-lg font-bold text-gray-800">Estados de Viajes</h3>
              </div>
              <div className="space-y-3">
                {/* Programados */}
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-2xl text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Programados</p>
                      <p className="text-xs text-gray-500">Por iniciar</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{generales.viajes_programados}</p>
                </div>

                {/* En Curso */}
                <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="flex items-center gap-3">
                    <FaTruckMoving className="text-2xl text-cyan-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">En Curso</p>
                      <p className="text-xs text-gray-500">En ruta</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-cyan-600">{generales.viajes_en_curso}</p>
                </div>

                {/* Finalizados */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-2xl text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Finalizados</p>
                      <p className="text-xs text-gray-500">Completados</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{generales.viajes_finalizados}</p>
                </div>
              </div>
            </div>

            {/* Km Recorridos */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <FaTachometerAlt className="text-5xl opacity-90" />
                </div>
                <div>
                  <p className="text-indigo-100 text-sm font-medium mb-1">Km Recorridos</p>
                  <p className="text-3xl font-bold">{generales.total_km_recorridos.toLocaleString('es-AR', {maximumFractionDigits: 0})}</p>
                  <p className="text-indigo-100 text-xs mt-2">Promedio: {generales.promedio_km_por_viaje.toFixed(0)} km</p>
                </div>
              </div>
            </div>

            {/* Choferes */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <FaUserTie className="text-5xl opacity-90" />
                </div>
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Total Choferes</p>
                  <p className="text-4xl font-bold mb-3">{choferes.length}</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white rounded-lg px-3 py-2">
                      <p className="text-xs text-purple-600 font-medium mb-1">Activos</p>
                      <p className="text-2xl font-bold text-purple-700">{choferes.filter(c => c.activo).length}</p>
                    </div>
                    <div className="flex-1 bg-purple-100 rounded-lg px-3 py-2">
                      <p className="text-xs text-purple-600 font-medium mb-1">Inactivos</p>
                      <p className="text-2xl font-bold text-purple-700">{choferes.filter(c => !c.activo).length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de Navegación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setTabActiva('general')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  tabActiva === 'general'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaChartBar />
                  <span>Vista General</span>
                </div>
              </button>
              <button
                onClick={() => setTabActiva('unidades')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  tabActiva === 'unidades'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaTruck />
                  <span>Por Unidad</span>
                </div>
              </button>
              <button
                onClick={() => setTabActiva('choferes')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  tabActiva === 'choferes'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>Por Chofer</span>
                </div>
              </button>
              <button
                onClick={() => setTabActiva('rendimiento')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  tabActiva === 'rendimiento'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaChartLine />
                  <span>Rendimiento</span>
                </div>
              </button>
            </div>
          </div>

          {/* Contenido de las pestañas */}
          {tabActiva === 'general' && (
            <div className="space-y-6">
              {/* Gráficos de Vista General */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Estados de Viaje */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Distribución de Viajes por Estado</h3>
                  {datosEstadosViaje.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={datosEstadosViaje}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value }: any) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {datosEstadosViaje.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-400">
                      <div className="text-center">
                        <FaChartBar className="mx-auto text-4xl mb-2" />
                        <p>No hay viajes registrados</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gráfico de Viajes por Mes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Tendencia de Viajes por Mes</h3>
                  {datosViajesPorMes.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={datosViajesPorMes}>
                        <defs>
                          <linearGradient id="colorViajes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="mes" 
                          stroke="#6B7280"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          allowDecimals={false} 
                          stroke="#6B7280"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="viajes" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorViajes)"
                          name="Viajes"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-400">
                      <div className="text-center">
                        <FaChartLine className="mx-auto text-4xl mb-2" />
                        <p>No hay datos mensuales disponibles</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Viajes por Servicio */}
              {estadisticas.viajes_por_servicio.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Viajes por Tipo de Servicio</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={estadisticas.viajes_por_servicio}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="servicio_nombre" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="viajes_programados" fill="#F59E0B" name="Programados" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="viajes_en_curso" fill="#06B6D4" name="En Curso" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="viajes_finalizados" fill="#10B981" name="Finalizados" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Viajes por Tipo de Servicio</h3>
                  <div className="flex items-center justify-center h-[300px] text-gray-400">
                    <div className="text-center">
                      <FaTruck className="mx-auto text-4xl mb-2" />
                      <p>No hay viajes por servicio registrados</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tabActiva === 'unidades' && (
            <div className="space-y-6">
              {/* Gráfico de Kilómetros por Unidad */}
              {datosKmPorUnidad.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Kilómetros Recorridos por Tractor</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={datosKmPorUnidad}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="km" fill="#3B82F6" name="Kilómetros" />
                      <Bar dataKey="viajes" fill="#10B981" name="Cantidad Viajes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tabla de Inactividad de Vehículos */}
              {estadisticas.inactividad_vehiculos.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaClock className="text-orange-500 text-xl" />
                    <h3 className="text-lg font-bold text-gray-900">Estado de Actividad de Tractores</h3>
                  </div>
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
                        {estadisticas.inactividad_vehiculos.map((item, index) => (
                          <tr key={index} className={
                            item.dias_inactivo >= 999 
                              ? '' 
                              : item.dias_inactivo > 30 
                                ? 'bg-red-50' 
                                : item.dias_inactivo > 7 
                                  ? 'bg-yellow-50' 
                                  : ''
                          }>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.tractor_marca} {item.tractor_modelo} - {item.tractor_dominio}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.ultimo_viaje ? formatDate(item.ultimo_viaje) : 'Sin viajes'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-3 py-1 rounded-full font-medium ${
                                item.dias_inactivo >= 999
                                  ? 'bg-gray-100 text-gray-800'
                                  : item.dias_inactivo > 30 
                                    ? 'bg-red-100 text-red-800' 
                                    : item.dias_inactivo > 7 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-green-100 text-green-800'
                              }`}>
                                {item.dias_inactivo >= 999 ? 'Sin viajes' : `${item.dias_inactivo} días`}
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
            </div>
          )}

          {tabActiva === 'choferes' && (
            <div className="space-y-6">
              {/* Gráfico de Viajes por Chofer */}
              {datosViajesPorChofer.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Distribución de Viajes por Chofer</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={datosViajesPorChofer}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#8B5CF6" name="Total Viajes" />
                      <Bar dataKey="programados" fill="#3B82F6" name="Programados" />
                      <Bar dataKey="en_curso" fill="#F59E0B" name="En Curso" />
                      <Bar dataKey="finalizados" fill="#10B981" name="Finalizados" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tabla detallada de choferes */}
              {estadisticas.viajes_por_chofer.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Detalle de Rendimiento por Chofer</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Chofer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Viajes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Programados
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            En Curso
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Finalizados
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Km Totales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Promedio km/Viaje
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {estadisticas.viajes_por_chofer.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.chofer_nombre} {item.chofer_apellido}
                              {!item.chofer_activo && (
                                <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                  Inactivo
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.total_viajes}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {item.viajes_programados}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                {item.viajes_en_curso}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                {item.viajes_finalizados}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.total_km.toLocaleString('es-AR', {maximumFractionDigits: 0})} km
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.total_viajes > 0 ? (item.total_km / item.total_viajes).toFixed(0) : '0'} km
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tabActiva === 'rendimiento' && (
            <div className="space-y-6">
              {/* Métricas de rendimiento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaRoute className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tasa de Finalización</p>
                      <p className="text-2xl font-bold text-gray-900">{((generales.viajes_finalizados / generales.total_viajes) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {generales.viajes_finalizados} de {generales.total_viajes} viajes completados
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FaTachometerAlt className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Promedio km/Viaje</p>
                      <p className="text-2xl font-bold text-gray-900">{generales.promedio_km_por_viaje.toFixed(0)} km</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Basado en {generales.total_viajes} viajes
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <FaUserTie className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Promedio Viajes/Chofer</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {generales.total_choferes_activos > 0 
                          ? (generales.total_viajes / generales.total_choferes_activos).toFixed(1) 
                          : '0'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {generales.total_choferes_activos} choferes activos
                  </p>
                </div>
              </div>

              {/* Gráfico de tendencia mensual */}
              {datosViajesPorMes.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Tendencia de Kilómetros por Mes</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={datosViajesPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="km" stroke="#10B981" name="Kilómetros" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
