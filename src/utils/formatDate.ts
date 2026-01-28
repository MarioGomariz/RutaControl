/**
 * Formatea una fecha en formato dd/mm/yyyy
 * Evita problemas de zona horaria parseando directamente el string
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '';
  // Parsear directamente el string YYYY-MM-DD sin conversión de zona horaria
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una fecha con hora en formato dd/mm/yyyy HH:mm
 * Evita problemas de zona horaria parseando directamente el string
 */
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
