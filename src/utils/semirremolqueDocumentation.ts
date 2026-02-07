// Configuración de documentación por tipo de servicio
// Solo hay 2 servicios: Gas Licuado y Combustible Liquido (sin tildes, como están en la BD)
export const SERVICE_DOCUMENTATION_CONFIG: Record<string, string[]> = {
  'gas licuado': ['vencimiento_mangueras', 'vencimiento_prueba_hidraulica', 'vencimiento_valvula_flujo'],
  'combustible liquido': ['vencimiento_rto', 'vencimiento_visual_externa', 'vencimiento_visual_interna', 'vencimiento_espesores'],
};

// Etiquetas amigables para los campos de documentación
export const DOCUMENTATION_LABELS: Record<string, string> = {
  'vencimiento_rto': 'RTO',
  'vencimiento_visual_externa': 'Visual Externa',
  'vencimiento_visual_interna': 'Visual Interna',
  'vencimiento_espesores': 'Espesores',
  'vencimiento_mangueras': 'Mangueras',
  'vencimiento_prueba_hidraulica': 'Prueba Hidráulica',
  'vencimiento_valvula_flujo': 'Válvula de Flujo',
};

// Etiquetas completas para formularios
export const DOCUMENTATION_LABELS_FULL: Record<string, string> = {
  'vencimiento_rto': 'Vencimiento RTO',
  'vencimiento_visual_externa': 'Vencimiento Visual Externa',
  'vencimiento_visual_interna': 'Vencimiento Visual Interna',
  'vencimiento_espesores': 'Vencimiento Espesores',
  'vencimiento_mangueras': 'Vencimiento Mangueras',
  'vencimiento_prueba_hidraulica': 'Vencimiento Prueba Hidráulica',
  'vencimiento_valvula_flujo': 'Vencimiento Válvula de Flujo',
};

/**
 * Obtiene los campos de documentación requeridos para un tipo de servicio
 */
export function getRequiredDocFields(tipoServicio: string | undefined): string[] {
  if (!tipoServicio) return [];
  return SERVICE_DOCUMENTATION_CONFIG[tipoServicio.toLowerCase()] || [];
}

/**
 * Verifica si un campo de documentación debe mostrarse para un tipo de servicio
 */
export function shouldShowDocField(fieldName: string, tipoServicio: string | undefined): boolean {
  if (!tipoServicio) return false;
  const allowedFields = getRequiredDocFields(tipoServicio);
  return allowedFields.includes(fieldName);
}

/**
 * Calcula los días hasta el vencimiento de una fecha
 * Compara solo las fechas sin tener en cuenta las horas
 */
export function getDaysUntilExpiration(dateString: string | undefined): number | null {
  if (!dateString) return null;
  
  // Parsear la fecha sin conversión de zona horaria
  const [year, month, day] = dateString.split('T')[0].split('-');
  const expirationDate = new Date(Number(year), Number(month) - 1, Number(day));
  
  // Obtener la fecha actual sin horas
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Calcular diferencia en días
  const diffTime = expirationDate.getTime() - todayDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina el estado de un vencimiento (vigente, próximo a vencer, vencido)
 */
export function getExpirationStatus(dateString: string | undefined): 'expired' | 'expiring-soon' | 'valid' | null {
  const days = getDaysUntilExpiration(dateString);
  if (days === null) return null;
  if (days <= 0) return 'expired'; // Hoy o antes = vencido (rojo)
  if (days <= 30) return 'expiring-soon';
  return 'valid';
}

/**
 * Obtiene el color de badge según el estado de vencimiento
 */
export function getExpirationBadgeColor(status: 'expired' | 'expiring-soon' | 'valid' | null): string {
  switch (status) {
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'expiring-soon':
      return 'bg-amber-100 text-amber-800';
    case 'valid':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Obtiene el texto del badge según el estado de vencimiento
 */
export function getExpirationBadgeText(dateString: string | undefined): string {
  const days = getDaysUntilExpiration(dateString);
  if (days === null) return 'Sin fecha';
  if (days < 0) return 'Vencido';
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Vence mañana';
  if (days <= 30) return `${days} días`;
  return 'Vigente';
}
