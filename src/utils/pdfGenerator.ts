import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ViajeCompleto {
  viaje: {
    id: number;
    origen: string;
    alcance: string;
    fecha_hora_salida: string;
    estado: string;
    cantidad_destinos: number;
    chofer_nombre: string;
    chofer_apellido: string;
    tractor_marca: string;
    tractor_modelo: string;
    tractor_dominio: string;
    semirremolque_nombre: string;
    semirremolque_dominio: string;
    servicio_nombre: string;
  };
  paradas: Array<{
    id: number;
    odometro: number;
    ubicacion: string;
    tipo: string;
    fecha_hora: string;
    destino_ubicacion?: string;
  }>;
  destinos: Array<{
    id: number;
    orden: number;
    ubicacion: string;
  }>;
}

export const generarPDFViaje = (data: ViajeCompleto) => {
  const doc = new jsPDF();
  const { viaje, paradas, destinos } = data;

  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Título principal
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE VIAJE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Información del viaje
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Información General', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const infoGeneral = [
    ['ID del Viaje:', `#${viaje.id}`],
    ['Estado:', viaje.estado.toUpperCase()],
    ['Origen:', viaje.origen],
    ['Alcance:', viaje.alcance],
    ['Fecha de Salida:', new Date(viaje.fecha_hora_salida).toLocaleString('es-ES')],
    ['Cantidad de Destinos:', viaje.cantidad_destinos.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: infoGeneral,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Información del personal y vehículos
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal y Vehículos', 14, yPosition);
  yPosition += 8;

  const infoVehiculos = [
    ['Chofer:', `${viaje.chofer_nombre} ${viaje.chofer_apellido}`],
    ['Tractor:', `${viaje.tractor_marca} ${viaje.tractor_modelo} - ${viaje.tractor_dominio}`],
    ['Semirremolque:', `${viaje.semirremolque_nombre} - ${viaje.semirremolque_dominio}`],
    ['Servicio:', viaje.servicio_nombre],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: infoVehiculos,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Destinos programados
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Destinos Programados', 14, yPosition);
  yPosition += 8;

  const destinosData = destinos.map(d => [
    d.orden.toString(),
    d.ubicacion
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Orden', 'Ubicación']],
    body: destinosData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Nueva página si es necesario
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Paradas registradas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Paradas Registradas', 14, yPosition);
  yPosition += 8;

  const paradasData = paradas.map((p, index) => [
    (index + 1).toString(),
    new Date(p.fecha_hora).toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1),
    p.ubicacion,
    `${p.odometro} km`,
    p.destino_ubicacion || '-'
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Fecha/Hora', 'Tipo', 'Ubicación', 'Odómetro', 'Destino']],
    body: paradasData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 25 },
      5: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  // Resumen al final
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen del Viaje', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const odometroInicio = paradas.find(p => p.tipo === 'inicio')?.odometro || 0;
  const odometroFinal = paradas.length > 0 ? paradas[paradas.length - 1].odometro : 0;
  const distanciaRecorrida = odometroFinal - odometroInicio;

  const resumen = [
    ['Total de Paradas:', paradas.length.toString()],
    ['Odómetro Inicial:', `${odometroInicio} km`],
    ['Odómetro Final:', `${odometroFinal} km`],
    ['Distancia Recorrida:', `${distanciaRecorrida.toFixed(2)} km`],
    ['Paradas de Descanso:', paradas.filter(p => p.tipo === 'descanso').length.toString()],
    ['Paradas de Carga:', paradas.filter(p => p.tipo === 'carga').length.toString()],
    ['Llegadas Completadas:', paradas.filter(p => p.tipo === 'llegada').length.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: resumen,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14 }
  });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleString('es-ES')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Guardar el PDF
  const fileName = `viaje-${viaje.id}-reporte-${new Date().getTime()}.pdf`;
  doc.save(fileName);
};
