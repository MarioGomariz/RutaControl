/**
 * Utilidades para normalizar inputs y evitar duplicados por diferencias de formato
 */

/**
 * Normaliza una matrícula removiendo espacios, guiones y convirtiendo a mayúsculas
 * Ejemplo: "ab 539-ro" -> "AB539RO"
 * @param matricula - Matrícula a normalizar
 * @returns Matrícula normalizada en mayúsculas sin espacios ni guiones
 */
export const normalizeMatricula = (matricula: string): string => {
  if (!matricula) return '';
  return matricula
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, ''); // Remueve espacios y guiones
};

/**
 * Normaliza un CUIT/CUIL removiendo guiones y espacios
 * Ejemplo: "20-12345678-9" -> "20123456789"
 * @param cuit - CUIT/CUIL a normalizar
 * @returns CUIT/CUIL normalizado sin guiones ni espacios
 */
export const normalizeCuit = (cuit: string): string => {
  if (!cuit) return '';
  return cuit
    .trim()
    .replace(/[\s-]/g, ''); // Remueve espacios y guiones
};

/**
 * Normaliza un número de teléfono removiendo espacios, guiones y paréntesis
 * Ejemplo: "(011) 4567-8900" -> "01145678900"
 * @param telefono - Teléfono a normalizar
 * @returns Teléfono normalizado sin espacios, guiones ni paréntesis
 */
export const normalizeTelefono = (telefono: string): string => {
  if (!telefono) return '';
  return telefono
    .trim()
    .replace(/[\s\-()]/g, ''); // Remueve espacios, guiones y paréntesis
};

/**
 * Normaliza un texto general removiendo espacios extras y convirtiendo a mayúsculas
 * Útil para nombres, apellidos, etc.
 * Ejemplo: "  juan   pérez  " -> "JUAN PÉREZ"
 * @param texto - Texto a normalizar
 * @returns Texto normalizado en mayúsculas con espacios únicos
 */
export const normalizeTexto = (texto: string): string => {
  if (!texto) return '';
  return texto
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' '); // Reemplaza múltiples espacios por uno solo
};

/**
 * Normaliza un email removiendo espacios y convirtiendo a minúsculas
 * Ejemplo: " Usuario@Example.COM " -> "usuario@example.com"
 * @param email - Email a normalizar
 * @returns Email normalizado en minúsculas sin espacios
 */
export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  return email
    .trim()
    .toLowerCase();
};

/**
 * Normaliza un DNI/documento removiendo puntos, espacios y guiones
 * Ejemplo: "12.345.678" -> "12345678"
 * @param dni - DNI a normalizar
 * @returns DNI normalizado sin puntos, espacios ni guiones
 */
export const normalizeDni = (dni: string): string => {
  if (!dni) return '';
  return dni
    .trim()
    .replace(/[\s.\-]/g, ''); // Remueve espacios, puntos y guiones
};

/**
 * Normaliza un número de chasis/VIN removiendo espacios y convirtiendo a mayúsculas
 * Ejemplo: "  3vw2k7aj9em  " -> "3VW2K7AJ9EM"
 * @param chasis - Número de chasis a normalizar
 * @returns Chasis normalizado en mayúsculas sin espacios
 */
export const normalizeChasis = (chasis: string): string => {
  if (!chasis) return '';
  return chasis
    .trim()
    .toUpperCase()
    .replace(/\s/g, ''); // Remueve espacios
};

/**
 * Normaliza un código postal removiendo espacios y guiones
 * Ejemplo: "C 1234 ABC" -> "C1234ABC"
 * @param codigoPostal - Código postal a normalizar
 * @returns Código postal normalizado sin espacios ni guiones
 */
export const normalizeCodigoPostal = (codigoPostal: string): string => {
  if (!codigoPostal) return '';
  return codigoPostal
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, ''); // Remueve espacios y guiones
};

/**
 * ============================================================================
 * FUNCIONES DE FORMATEO PARA VISUALIZACIÓN
 * ============================================================================
 */

/**
 * Formatea una matrícula para visualización con espacios estándar
 * Ejemplo: "AB539RO" -> "AB 539 RO"
 * @param matricula - Matrícula normalizada
 * @returns Matrícula formateada para visualización
 */
export const formatMatricula = (matricula: string): string => {
  if (!matricula) return '';
  const normalized = normalizeMatricula(matricula);
  
  // Formato argentino: 2 letras + 3 números + 2 letras (AB 123 CD)
  if (normalized.length === 7) {
    return `${normalized.slice(0, 2)} ${normalized.slice(2, 5)} ${normalized.slice(5, 7)}`;
  }
  
  // Formato antiguo: 3 letras + 3 números (ABC 123)
  if (normalized.length === 6) {
    return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)}`;
  }
  
  // Si no coincide con formatos conocidos, devolver normalizado
  return normalized;
};

/**
 * Formatea un CUIT/CUIL para visualización
 * Ejemplo: "20123456789" -> "20-12345678-9"
 * @param cuit - CUIT/CUIL normalizado
 * @returns CUIT/CUIL formateado para visualización
 */
export const formatCuit = (cuit: string): string => {
  if (!cuit) return '';
  const normalized = normalizeCuit(cuit);
  
  if (normalized.length === 11) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2, 10)}-${normalized.slice(10, 11)}`;
  }
  
  return normalized;
};

/**
 * Formatea un DNI para visualización con puntos
 * Ejemplo: "12345678" -> "12.345.678"
 * @param dni - DNI normalizado
 * @returns DNI formateado para visualización
 */
export const formatDni = (dni: string): string => {
  if (!dni) return '';
  const normalized = normalizeDni(dni);
  
  // Agregar puntos cada 3 dígitos desde el final
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Formatea un teléfono para visualización
 * Ejemplo: "01145678900" -> "(011) 4567-8900"
 * @param telefono - Teléfono normalizado
 * @returns Teléfono formateado para visualización
 */
export const formatTelefono = (telefono: string): string => {
  if (!telefono) return '';
  const normalized = normalizeTelefono(telefono);
  
  // Formato con código de área (011) 4567-8900
  if (normalized.length === 11 && normalized.startsWith('0')) {
    return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 7)}-${normalized.slice(7, 11)}`;
  }
  
  // Formato sin 0 inicial (11) 4567-8900
  if (normalized.length === 10) {
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6, 10)}`;
  }
  
  // Formato simple 4567-8900
  if (normalized.length === 8) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}`;
  }
  
  return normalized;
};

/**
 * Formatea un email para visualización (lowercase)
 * Ejemplo: "USUARIO@EXAMPLE.COM" -> "usuario@example.com"
 * @param email - Email normalizado
 * @returns Email formateado para visualización
 */
export const formatEmail = (email: string): string => {
  if (!email) return '';
  return normalizeEmail(email);
};

/**
 * Formatea un texto con capitalización de nombres propios
 * Ejemplo: "JUAN PÉREZ" -> "Juan Pérez"
 * @param texto - Texto normalizado
 * @returns Texto formateado con capitalización
 */
export const formatNombrePropio = (texto: string): string => {
  if (!texto) return '';
  
  return texto
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea un código postal para visualización
 * Ejemplo: "C1234ABC" -> "C1234ABC" (sin cambios, ya está normalizado)
 * @param codigoPostal - Código postal normalizado
 * @returns Código postal formateado
 */
export const formatCodigoPostal = (codigoPostal: string): string => {
  if (!codigoPostal) return '';
  return normalizeCodigoPostal(codigoPostal);
};
