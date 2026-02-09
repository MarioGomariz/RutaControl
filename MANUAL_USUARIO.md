# Manual de Usuario - RutaControl
## Sistema de Gestión de Transporte de Cargas Líquidas

**Versión**: 2.0  
**Fecha**: Febrero 2026

---

## Índice Completo

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Roles y Permisos](#4-roles-y-permisos)
5. [Módulo Choferes](#5-módulo-choferes)
6. [Módulo Tractores](#6-módulo-tractores)
7. [Módulo Semirremolques](#7-módulo-semirremolques)
8. [Módulo Viajes](#8-módulo-viajes)
9. [Módulo Paradas](#9-módulo-paradas)
10. [Módulo Estadísticas](#10-módulo-estadísticas)
11. [Módulo Usuarios](#11-módulo-usuarios)
12. [Flujos de Trabajo](#12-flujos-de-trabajo)
13. [Gestión de Documentación](#13-gestión-de-documentación)
14. [Reportes y Exportación](#14-reportes-y-exportación)
15. [Solución de Problemas](#15-solución-de-problemas)
16. [Preguntas Frecuentes](#16-preguntas-frecuentes)
17. [Glosario](#17-glosario)

---

## 1. Introducción

### 1.1 ¿Qué es RutaControl?

RutaControl es un sistema de gestión integral diseñado para empresas de transporte de cargas líquidas. Centraliza toda la información de choferes, vehículos y viajes, permitiendo un control eficiente de las operaciones.

### 1.2 Características Principales

• **Gestión de Flotas**: Control completo de tractores y semirremolques  
• **Administración de Personal**: Registro y seguimiento de choferes  
• **Control de Viajes**: Desde planificación hasta finalización  
• **Registro de Paradas**: Seguimiento detallado de cada parada  
• **Alertas de Vencimientos**: Notificaciones automáticas de documentación  
• **Estadísticas Avanzadas**: Análisis de rendimiento y KPIs  
• **Reportes PDF**: Exportación de información detallada  
• **Responsive**: Funciona en PC, tablets y smartphones

### 1.3 Tipos de Servicio

El sistema maneja **2 tipos de servicio fijos**:

**1. Gas Licuado**
- Documentación: Mangueras, Prueba Hidráulica, Válvula de Flujo

**2. Combustible Líquido**
- Documentación: RTO, Visual Externa, Visual Interna, Espesores

---

## 2. Requisitos del Sistema

### 2.1 Navegadores Compatibles
- Chrome 90+ (Recomendado)
- Firefox 88+
- Safari 14+
- Edge 90+

### 2.2 Dispositivos
- Computadoras (Windows, macOS, Linux)
- Tablets (iOS, Android)
- Smartphones (iOS, Android)

### 2.3 Conexión
- Internet estable
- Velocidad mínima: 2 Mbps

### 2.4 Resolución
- Mínimo: 1024x768
- Recomendado: 1366x768+

---

## 3. Acceso al Sistema

### 3.1 Inicio de Sesión

1. Abra el navegador e ingrese la URL del sistema
2. Complete:
   - **Usuario**: Su nombre de usuario
   - **Contraseña**: Su contraseña (case-sensitive)
3. Click en **"Iniciar Sesión"**

### 3.2 Primera Configuración (Setup)

Si no hay usuarios en el sistema:

1. Acceda a `/setup`
2. Complete:
   - Nombre de usuario
   - Contraseña
   - Confirmar contraseña
3. Click en **"Crear Administrador"**

### 3.3 Recuperación de Contraseña

Contacte al administrador del sistema para restablecer su contraseña.

### 3.4 Cerrar Sesión

1. Click en su nombre (esquina superior derecha)
2. Seleccione **"Cerrar Sesión"**

---

## 4. Roles y Permisos

El sistema cuenta con **4 roles** diferentes, cada uno con permisos específicos según sus responsabilidades:

### 4.1 Administrador

**Acceso Total al Sistema**

**Puede hacer**:
-  Gestionar usuarios (crear, editar, eliminar)
-  Gestionar choferes (crear, editar, eliminar)
-  Gestionar tractores (crear, editar, eliminar)
-  Gestionar semirremolques (crear, editar, eliminar)
-  Crear, editar y eliminar viajes
-  Ver todos los viajes del sistema
-  Ver paradas de todos los viajes
-  Acceso completo a estadísticas
-  Descargar reportes PDF
-  Actualizar fechas de vencimiento de documentación

**Descripción**: Tiene control total sobre todas las funcionalidades del sistema. Es el único rol que puede gestionar usuarios y tiene permisos para todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar).

---

### 4.2 Chofer

**Acceso Operativo Limitado**

**Puede hacer**:
-  Ver solo sus viajes asignados
-  Iniciar viajes programados
-  Registrar paradas durante el viaje
-  Finalizar viajes

**No puede hacer**:
-  Crear viajes
-  Ver viajes de otros choferes
-  Gestionar usuarios
-  Gestionar vehículos (tractores/semirremolques)
-  Gestionar otros choferes
-  Acceder a estadísticas
-  Descargar reportes

**Descripción**: Rol operativo enfocado en la ejecución de viajes. Solo puede ver y gestionar sus propios viajes asignados. Ideal para conductores que necesitan registrar paradas y finalizar viajes.

---

### 4.3 Analista

**Acceso de Solo Lectura a Estadísticas**

**Puede hacer**:
-  Ver estadísticas completas del sistema
-  Analizar métricas de rendimiento
-  Ver gráficos y reportes visuales
-  Filtrar datos por período, chofer y servicio

**No puede hacer**:
-  Gestionar choferes, tractores o semirremolques
-  Crear, editar o eliminar viajes
-  Ver información detallada de vehículos
-  Gestionar usuarios
-  Descargar reportes PDF
-  Modificar ningún dato del sistema

**Descripción**: Rol especializado en análisis de datos. Tiene acceso de solo lectura a las estadísticas del sistema para generar insights y análisis de rendimiento sin poder modificar información operativa.

---

### 4.4 Logístico

**Acceso de Gestión de Flota**

**Puede hacer**:
-  Ver listado de choferes
-  Ver listado de tractores
-  Ver listado de semirremolques
-  Actualizar fechas de vencimiento de documentación
-  Monitorear estado de vencimientos

**No puede hacer**:
-  Crear, editar o eliminar choferes
-  Crear, editar o eliminar tractores
-  Crear, editar o eliminar semirremolques
-  Gestionar viajes
-  Ver estadísticas
-  Gestionar usuarios

**Descripción**: Rol enfocado en el mantenimiento y control de documentación de la flota. Puede visualizar toda la información de choferes y vehículos, y actualizar fechas de vencimiento de documentación (licencias, RTO, inspecciones, etc.) sin poder modificar otros datos.

---

### 4.5 Resumen de Permisos por Módulo

| Módulo | Administrador | Chofer | Analista | Logístico |
|--------|--------------|--------|----------|----------|
| **Usuarios** |  CRUD | Sin acceso | Sin acceso | Sin acceso |
| **Choferes** |  CRUD | Sin acceso | Sin acceso |  Ver |
| **Tractores** |  CRUD | Sin acceso | Sin acceso |  Ver |
| **Semirremolques** |  CRUD | Sin acceso | Sin acceso |  Ver |
| **Viajes** |  CRUD |  Ver propios | Sin acceso | Sin acceso |
| **Paradas** |  Ver todas |  Gestionar propias | Sin acceso | Sin acceso |
| **Estadísticas** |  Ver | Sin acceso |  Ver | Sin acceso |
| **Vencimientos** | Editar | Sin acceso | Sin acceso | Editar |
| **Reportes PDF** | Descargar | Sin acceso | Descargar | Sin acceso |

---

## 5. Módulo: Choferes

### 5.1 Listar Choferes

**Acceso**: Menú → Choferes

**Información mostrada**:
- Nombre completo
- DNI
- Teléfono
- Mail
- Estado (Activo/Inactivo)
- Licencia
- Vencimiento de licencia con código de colores

**Código de colores**:
- **Rojo**: Licencia vencida
- **Amarillo**: Vence en ≤30 días
- **Verde**: Vigente

### 5.2 Agregar Chofer

1. Click en **"Agregar nuevo chofer"**
2. Complete:
   - **Nombre** (obligatorio)
   - **Apellido** (obligatorio)
   - **DNI** (obligatorio, único)
   - **Teléfono** (obligatorio)
   - **Mail** (obligatorio)
   - **Licencia** (obligatorio)
   - **Vencimiento Licencia** (obligatorio)
   - **Estado**: Activo/Inactivo
3. Click en **"Guardar"**

**Validaciones**:
- DNI único (no duplicado)
- Todos los campos obligatorios completos

### 5.3 Editar Chofer

1. Click en la tarjeta del chofer para **"Editar"**
2. Modifique los campos necesarios
3. Click en **"Actualizar"**

### 5.4 Eliminar Chofer

1. Entre en modo edición
2. Click en **"Eliminar"**
3. Confirme la acción

**Restricción**: No se puede eliminar si tiene viajes asignados. El sistema mostrará un mensaje claro: *"No se puede eliminar el chofer porque está asignado a uno o más viajes"*.

---

## 6. Módulo: Tractores

### 6.1 Listar Tractores

**Información mostrada**:
- Patente
- Marca y modelo
- Año
- Estado

**Estados**:
- **Disponible**: Listo para ser asignado a un viaje
- **En viaje**: Asignado a un viaje en curso (automático)
- **En reparación**: En mantenimiento, no disponible
- **Fuera de servicio**: No operativo

**Importante**: El estado "En viaje" se asigna automáticamente cuando un chofer inicia un viaje. No puede seleccionarse manualmente.

### 6.2 Agregar Tractor

1. Click en **"Agregar nuevo tractor"**
2. Complete:
   - **Patente** (obligatorio, único)
   - **Marca** (obligatorio)
   - **Modelo** (obligatorio)
   - **Año** (obligatorio, 1990-actual+1)
   - **Tipo de Servicio** (obligatorio): Gas Líquido o Combustible Líquido
   - **Alcance de Servicio**: Nacional o Internacional
   - **Estado**: Disponible, En reparación o Fuera de servicio
3. Click en **"Guardar"**

**Validaciones en tiempo real**:
- El sistema verifica que la patente no esté duplicada mientras escribe
- Mensaje de error si la patente ya existe
- El botón de guardar se deshabilita si hay errores

### 6.3 Editar/Eliminar

Similar a Choferes. 

**Restricción de eliminación**: No se puede eliminar si tiene viajes asignados. El sistema mostrará un mensaje claro: *"No se puede eliminar el tractor porque está asignado a uno o más viajes"*.

---

## 7. Módulo: Semirremolques

### 7.1 Tipos de Servicio y Documentación

**Gas Licuado**:
- Mangueras
- Prueba Hidráulica
- Válvula de Flujo

**Combustible Líquido**:
- RTO
- Visual Externa
- Visual Interna
- Espesores

**Importante**: Los campos de documentación se muestran dinámicamente según el tipo de servicio.

### 7.2 Agregar Semirremolque

1. Click en **"Agregar nuevo semirremolque"**
2. **Sección 1: Información**
   - Nombre/Tipo
   - Dominio (Patente) - único
   - Año
   - Estado: Disponible, En reparación o Fuera de servicio
3. **Sección 2: Servicio**
   - Tipo de Servicio (Gas Líquido o Combustible Líquido)
   - Alcance (Nacional/Internacional)
4. **Sección 3: Documentación**
   - Complete las fechas de vencimiento según el tipo de servicio
   - Todos los campos mostrados son obligatorios
5. Click en **"Guardar"**

**Validaciones en tiempo real**:
- El sistema verifica que el dominio no esté duplicado mientras escribe
- Mensaje de error si el dominio ya existe
- El botón de guardar se deshabilita si hay errores

**Importante**: 
- El botón cambia según la acción: "Guardar" (crear) o "Actualizar" (editar)
- El estado "En viaje" se asigna automáticamente, no puede seleccionarse manualmente

### 7.3 Editar Semirremolque

1. Click en el semirremolque para editarlo
2. Puede modificar:
   - Nombre/Tipo
   - Dominio (con validación en tiempo real)
   - Año
   - Estado (excepto "En viaje")
   - Alcance de servicio
   - Fechas de documentación
3. Click en **"Actualizar"**

**Restricción importante**: 
- **El Tipo de Servicio NO puede modificarse** una vez creado el semirremolque
- Esto previene inconsistencias en la documentación registrada
- Si necesita cambiar el tipo de servicio, debe crear un nuevo semirremolque

### 7.4 Eliminar Semirremolque

1. Entre en modo edición
2. Click en **"Eliminar"**
3. Confirme la acción

**Restricción**: No se puede eliminar si tiene viajes asignados. El sistema mostrará un mensaje claro: *"No se puede eliminar el semirremolque porque está asignado a uno o más viajes"*.

### 7.5 Código de Colores

**Borde de la tarjeta**:
- **Rojo**: Al menos un documento vencido
- **Amarillo**: Al menos un documento vence en ≤30 días
- **Verde**: Toda la documentación vigente

---

## 8. Módulo: Viajes

### 8.1 Listar Viajes

**Vista Administrador**: Ve todos los viajes  
**Vista Chofer**: Ve solo sus viajes asignados

**Filtros**:
- Todos
- Programados
- En curso
- Finalizados

**Estados**:
- **Programado** (Azul): Pendiente de inicio
- **En curso** (Amarillo): Viaje activo
- **Finalizado** (Verde): Completado

### 8.2 Crear Viaje (Solo Admin)

1. Click en **"Agregar nuevo viaje"**
2. **Sección 1: Vehículo y Conductor**
   - Chofer (solo activos)
   - Tractor (muestra todos, pero deshabilita los que están en reparación o fuera de servicio)
   - Semirremolque (muestra todos, pero deshabilita los que están en reparación o fuera de servicio)
3. **Sección 2: Servicio y Ruta**
   - Servicio (Gas Líquido o Combustible Líquido)
   - Alcance (Nacional o Internacional)
4. **Sección 3: Destinos**
   - Agregue destinos con el botón verde
   - Ingrese ubicación de cada destino
   - Elimine destinos con el botón rojo (si hay más de uno)
   - El orden de los destinos es el orden de visita
5. **Sección 4: Origen y Fecha**
   - Origen (ubicación de salida)
   - Fecha de salida (solo fecha, sin hora)
6. Click en **"Crear viaje"**

**Estado inicial**: El viaje se crea automáticamente con estado **"Programado"**. No es necesario seleccionar el estado.

**Validaciones**:
- Todos los campos obligatorios completos
- Al menos un destino con ubicación
- Chofer, tractor y semirremolque seleccionados
- No se pueden asignar unidades en reparación o fuera de servicio

**Advertencias**:
- Si selecciona un tractor o semirremolque que está "En viaje", el sistema mostrará una advertencia informativa
- Puede asignarlo, pero el nuevo viaje no podrá iniciarse hasta que la unidad esté disponible

### 8.3 Editar Viaje (Solo Admin)

1. Click en el viaje para ver sus detalles
2. Modifique los campos necesarios:
   - Chofer, tractor, semirremolque
   - Servicio y alcance
   - Destinos
   - Origen y fecha
   - **Estado** (solo visible en modo edición)
3. Click en **"Guardar cambios"**

**Cambio de estado manual**:
- Al editar un viaje, puede cambiar manualmente el estado entre:
  - Programado
  - En curso
  - Finalizado
- Esto permite correcciones administrativas si es necesario

**Restricciones**:
- **Viajes finalizados**: No se pueden editar ni eliminar
- El sistema muestra un mensaje: "🔒 Este viaje está finalizado y no puede ser modificado ni eliminado"
- Todos los campos están deshabilitados en viajes finalizados

### 8.4 Eliminar Viaje (Solo Admin)

1. Entre en modo edición del viaje
2. Click en **"Eliminar"**
3. Confirme la acción

**Restricciones**: 
- No se pueden eliminar viajes finalizados
- El botón "Eliminar" no aparece en viajes finalizados

**Efecto en unidades**:
- Si el viaje no estaba finalizado, las unidades asignadas vuelven a estado "Disponible"
- Si el viaje estaba finalizado, las unidades mantienen su estado actual

---

## 9. Módulo: Paradas

### 9.1 Iniciar Viaje (Chofer)

**Para viajes Programados**:

1. En la lista de viajes, click en **"Iniciar Viaje"**
2. Verá la información del viaje:
   - Ubicación de salida
   - Cantidad de destinos
   - Fecha de salida
3. Ingrese el **Odómetro Inicial** (km)
4. Click en **"Iniciar Viaje"**

**Resultado**:
- Se registra parada de tipo "Inicio" automáticamente
- Ubicación: origen del viaje (automático)
- **Estado del viaje**: Cambia de "Programado" a "En Curso"
- **Estado del tractor**: Cambia automáticamente a "En viaje"
- **Estado del semirremolque**: Cambia automáticamente a "En viaje"

**Importante**: Solo necesita ingresar el odómetro. La ubicación se toma automáticamente del origen del viaje.

### 9.2 Tipos de Paradas

**Parada de Inicio**:
- Se registra automáticamente al iniciar el viaje
- Requiere: odómetro
- Ubicación: origen del viaje (automático)

**Parada de Descanso**:
- Para descansos del chofer
- Requiere: odómetro + ubicación manual

**Parada de Carga**:
- Para cargas de combustible u otros
- Requiere: odómetro + ubicación manual

**Parada de Llegada**:
- Para llegadas a destinos programados
- Requiere: odómetro + selección de destino
- Ubicación: se completa automáticamente del destino

**Parada Otro**:
- Para cualquier otra parada
- Requiere: odómetro + ubicación manual

### 9.3 Agregar Paradas (Chofer)

**Para viajes En Curso**:

1. Click en **"Ver Paradas"**
2. Click en **"Agregar Parada"**
3. En el modal, seleccione:
   - **Tipo de Parada**: Descanso, Carga, Llegada u Otro
   - **Odómetro** (obligatorio): Lectura actual en km
   - **Ubicación** (si no es llegada): Ingrese manualmente
   - **Destino** (si es llegada): Seleccione de la lista
4. Click en **"Agregar"**

**Comportamiento según tipo**:

- **Descanso/Carga/Otro**: Debe ingresar ubicación manualmente
- **Llegada**: Debe seleccionar destino, la ubicación se completa automáticamente

### 9.4 Finalizar Viaje (Chofer)

**Requisitos**:
- Todas las llegadas registradas
- Ejemplo: 3 destinos = 3 paradas de tipo "Llegada"

**Pasos**:
1. Verifique que todas las llegadas estén registradas
2. El botón **"Finalizar Viaje"** se habilitará automáticamente
3. Click en **"Finalizar Viaje"**
4. Confirme la acción

**Resultado**:
- **Estado del viaje**: Cambia de "En Curso" a "Finalizado"
- **Estado del tractor**: Cambia automáticamente a "Disponible"
- **Estado del semirremolque**: Cambia automáticamente a "Disponible"
- El viaje queda bloqueado y no puede modificarse

**Nota**: No se puede finalizar sin registrar todas las llegadas programadas.

### 9.5 Ver Paradas

**Administrador y Chofer**:

1. Click en **"Ver Paradas"**
2. Verá la lista completa:
   - Número de parada
   - Tipo (con icono)
   - Fecha y hora
   - Ubicación
   - Odómetro
   - Destino (si aplica)

**Iconos de tipos**:
- **Inicio** (Verde)
- **Descanso** (Amarillo)
- **Carga** (Azul)
- **Llegada** (Púrpura)
- **Otro** (Gris)

---

## 10. Módulo: Estadísticas

### 10.1 Métricas Principales

**6 Cards con KPIs**:
1. **Total Viajes**: Cantidad total
2. **Viajes Programados**: Pendientes de inicio
3. **Viajes En Curso**: Actualmente en ejecución
4. **Viajes Finalizados**: Completados
5. **Km Recorridos**: Total de kilómetros
6. **Choferes Activos**: Cantidad de choferes activos

### 10.2 Pestañas de Análisis

**1. Vista General**:
- Distribución de viajes por estado (gráfico de torta)
- Viajes por mes (gráfico de línea)
- Viajes por tipo de servicio (gráfico de barras)

**2. Por Unidad**:
- Kilómetros por tractor (gráfico de barras)
- Tabla de actividad de tractores:
  - **Rojo**: +30 días inactivo
  - **Amarillo**: +7 días inactivo
  - **Verde**: Activo (≤7 días)
  - **Gris**: Sin viajes (nunca usado)

**Nota sobre días de inactividad**:
- Solo se cuentan viajes finalizados o en curso
- Viajes programados no afectan el cálculo
- "Sin viajes" indica que el tractor nunca ha tenido viajes finalizados

**3. Por Chofer**:
- Distribución de viajes por chofer (gráfico de barras)
- Tabla detallada:
  - Total viajes
  - Finalizados
  - En curso
  - Km totales
  - Promedio km/viaje

**4. Rendimiento**:
- Tasa de finalización
- Promedio km/viaje
- Promedio viajes/chofer
- Tendencia de kilómetros por mes

### 10.3 Filtros

**Disponibles**:
- **Rango de fechas**: Fecha desde/hasta
- **Chofer específico**: Seleccione de la lista
- **Tipo de servicio**: Gas Licuado, Combustible Líquido o Todos

**Aplicar filtros**:
1. Click en **"Filtros"**
2. Configure los filtros deseados
3. Click en **"Aplicar Filtros"**

**Limpiar filtros**:
- Click en **"Limpiar Filtros"**

### 10.4 Exportar PDF

**PDF General** (sin chofer seleccionado):
1. Configure filtros si desea
2. Click en **"Exportar PDF"**
3. Se genera PDF con:
   - Estadísticas generales
   - Top 5 choferes
   - Gráficos y tablas

**PDF Detallado** (con chofer seleccionado):
1. Seleccione un chofer en los filtros
2. Click en **"Exportar PDF"**
3. Se genera PDF con:
   - Viajes detallados del chofer
   - Tabla con: Día salida, Fecha salida, Sale de, Día llegada, Fecha llegada, Llega a, Km comunes, Km 100x100
   - Totales de kilómetros
   - Cantidad de tramos

---

## 11. Módulo: Usuarios (Solo Admin)

### 11.1 Listar Usuarios

**Información mostrada**:
- Nombre de usuario
- Rol (Admin/Chofer)
- Estado (Activo/Inactivo)

### 11.2 Crear Usuario

1. Click en **"Agregar nuevo usuario"**
2. Complete:
   - **Nombre de usuario** (obligatorio, único)
   - **Contraseña** (obligatorio)
   - **Confirmar contraseña** (obligatorio)
   - **Rol** (obligatorio):
     - Administrador: Acceso completo
     - Chofer: Acceso limitado
   - **Chofer asociado** (solo si rol = Chofer): Seleccione de la lista
3. Click en **"Guardar"**

**Importante**: Usuarios con rol "Chofer" deben asociarse a un chofer existente.

### 11.3 Editar Usuario

1. Click en **"Editar"**
2. Puede modificar:
   - Contraseña (opcional)
   - Rol
   - Chofer asociado
3. Click en **"Guardar"**

### 11.4 Eliminar Usuario

**Restricción**: No se puede eliminar el último usuario administrador.

---

## 12. Flujos de Trabajo

### 12.1 Flujo Completo de Viaje

**Paso 1: Preparación (Admin)**
1. Registrar chofer
2. Registrar tractor con tipo de servicio
   - Seleccionar: Disponible, En reparación o Fuera de servicio
   - **Nota**: "En viaje" se asigna automáticamente
3. Registrar semirremolque con documentación
   - Seleccionar tipo de servicio (NO modificable después)
   - Completar documentación según tipo de servicio
4. Crear usuario para chofer (si no existe)

**Paso 2: Programación (Admin)**
1. Crear viaje
2. Asignar chofer, tractor, semirremolque
   - Unidades en reparación/fuera de servicio aparecen deshabilitadas
   - Unidades "en viaje" muestran advertencia pero pueden asignarse
3. Definir origen, destinos y fecha
4. **Estado automático**: Programado (no requiere selección)
5. **Estados de unidades**: Sin cambios (permanecen como están)

**Paso 3: Inicio (Chofer)**
1. Login como chofer
2. Viajes → Localizar viaje programado
3. Click en "Iniciar Viaje"
4. Ingresar odómetro inicial
5. **Cambios automáticos**:
   - Sistema registra parada de inicio
   - Estado del viaje: Programado → **En Curso**
   - Estado del tractor: → **En viaje**
   - Estado del semirremolque: → **En viaje**

**Paso 4: Durante el Viaje (Chofer)**
1. Registrar paradas según necesidad:
   - Descansos: odómetro + ubicación manual
   - Cargas: odómetro + ubicación manual
   - Llegadas: odómetro + selección de destino (ubicación automática)
2. Repetir para cada destino
3. **Estados**: Permanecen sin cambios durante el viaje

**Paso 5: Finalización (Chofer)**
1. Verificar todas las llegadas registradas
2. Click en "Finalizar Viaje"
3. Confirmar
4. **Cambios automáticos**:
   - Estado del viaje: En Curso → **Finalizado**
   - Estado del tractor: En viaje → **Disponible**
   - Estado del semirremolque: En viaje → **Disponible**
   - Viaje bloqueado (no editable ni eliminable)

**Paso 6: Revisión (Admin)**
1. Ver paradas del viaje (solo lectura)
2. Descargar PDF con información completa
3. Revisar estadísticas
4. **Nota**: No se puede editar ni eliminar viajes finalizados

### 12.2 Flujo de Estados Automáticos

**Sistema de Estados Automáticos de Unidades**:

El sistema gestiona automáticamente los estados de tractores y semirremolques según el ciclo de vida del viaje:

```
CREACIÓN DE VIAJE (Admin)
└─ Viaje: Programado (automático)
└─ Tractor: Sin cambios
└─ Semirremolque: Sin cambios

INICIO DE VIAJE (Chofer)
└─ Viaje: Programado → En Curso
└─ Tractor: Cualquier estado → En viaje
└─ Semirremolque: Cualquier estado → En viaje

FINALIZACIÓN DE VIAJE (Chofer)
└─ Viaje: En Curso → Finalizado
└─ Tractor: En viaje → Disponible
└─ Semirremolque: En viaje → Disponible

ELIMINACIÓN DE VIAJE (Admin)
└─ Si NO finalizado:
   └─ Tractor: → Disponible
   └─ Semirremolque: → Disponible
└─ Si finalizado:
   └─ No se puede eliminar
```

**Estados Manuales vs Automáticos**:

**Estados que el Admin puede asignar manualmente**:
- Disponible
- En reparación
- Fuera de servicio

**Estado automático (NO seleccionable)**:
- En viaje (solo el sistema lo asigna)

**Edición manual de estado de viaje**:
- Al editar un viaje existente, el admin puede cambiar manualmente el estado
- Esto permite correcciones administrativas cuando sea necesario
- Los cambios manuales de estado también actualizan los estados de las unidades

### 12.3 Flujo de Renovación de Documentación

**Monitoreo**:
1. Revisar semirremolques semanalmente
2. Identificar documentación en amarillo o rojo

**Renovación**:
1. Programar inspección/renovación
2. Realizar inspección
3. Obtener nueva certificación
4. Actualizar fecha en el sistema:
   - Editar semirremolque
   - Actualizar fecha de vencimiento
   - Guardar
5. Verificar que el color cambie a verde

---

## 13. Gestión de Documentación

### 13.1 Documentación por Servicio

**Gas Licuado**:
| Documento | Descripción | Frecuencia |
|-----------|-------------|------------|
| Mangueras | Inspección y certificación | Según normativa |
| Prueba Hidráulica | Prueba de presión del tanque | Anual/Bianual |
| Válvula de Flujo | Certificación de válvulas | Según normativa |

**Combustible Líquido**:
| Documento | Descripción | Frecuencia |
|-----------|-------------|------------|
| RTO | Revisión Técnica Obligatoria | Anual |
| Visual Externa | Inspección visual externa | Según normativa |
| Visual Interna | Inspección visual interna | Según normativa |
| Espesores | Medición de espesores | Según normativa |

### 13.2 Sistema de Alertas

**Código de Colores**:
- **Rojo (Vencido)**: Acción inmediata requerida
- **Amarillo (≤30 días)**: Planificar renovación
- **Verde (>30 días)**: Vigente

**Aplicación**:
- **Choferes**: Licencia de conducir
- **Semirremolques**: Documentación según tipo de servicio

### 13.3 Buenas Prácticas

1. **Revisión semanal**: Verificar vencimientos cada semana
2. **Planificación anticipada**: Renovar cuando aparezca en amarillo
3. **Registro inmediato**: Actualizar fechas apenas se renueve
4. **Documentación física**: Mantener copias en los vehículos
5. **Calendario**: Mantener un calendario de vencimientos

---

## 14. Reportes y Exportación

### 14.1 PDF de Viaje Finalizado

**Generación**:
1. Localice el viaje finalizado
2. Click en botón **"PDF"** (icono de descarga)
3. Se descarga automáticamente

**Contenido**:
- Información completa del viaje
- Datos del chofer
- Datos del tractor y semirremolque
- Lista detallada de todas las paradas
- Kilómetros recorridos
- Tiempos de viaje

### 14.2 PDF de Estadísticas

**PDF General**:
- Estadísticas generales
- Top choferes
- Gráficos y tablas

**PDF Detallado por Chofer**:
- Tabla de viajes con:
  - Día y fecha de salida
  - Origen
  - Día y fecha de llegada
  - Destino
  - Km comunes y 100x100
- Totales y resumen

---

## 15. Solución de Problemas

### 15.1 No puedo iniciar sesión

**Causas y soluciones**:
- **Credenciales incorrectas**: Verifique usuario y contraseña (case-sensitive)
- **Usuario inactivo**: Contacte al administrador
- **Problemas de conexión**: Verifique Internet, recargue la página (F5)

### 15.2 No puedo iniciar un viaje

**Causas**:
- Solo se inician viajes "Programados"
- Solo choferes pueden iniciar
- Viaje ya iniciado

### 15.3 No puedo finalizar un viaje

**Causas**:
- Faltan paradas de llegada
- Debe registrar todas las llegadas (X/Y)
- Solo el chofer asignado puede finalizar

### 15.4 No veo todos los viajes

**Causas**:
- Choferes solo ven sus viajes (diseño de seguridad)
- Filtros activos
- Admins ven todos los viajes

### 15.5 Error al agregar parada

**Soluciones**:
- Verifique campos obligatorios
- Llegadas requieren destino
- Otras paradas requieren ubicación manual
- Verifique conexión a Internet

### 15.6 Documentación no se actualiza

**Soluciones**:
- Recargue la página (F5)
- Verifique que guardó correctamente
- Limpie caché del navegador

---

## 16. Preguntas Frecuentes

**¿Puedo editar un viaje finalizado?**  
No, los viajes finalizados no se pueden editar para mantener integridad de datos.

**¿Puedo eliminar una parada?**  
No, las paradas no se pueden eliminar una vez registradas.

**¿Cuántos destinos puede tener un viaje?**  
No hay límite, pero debe registrar llegada a todos.

**¿Puedo cambiar el tipo de servicio de un tractor o semirremolque?**  
No. El tipo de servicio queda bloqueado una vez creada la unidad para prevenir inconsistencias en la documentación registrada. Si necesita cambiar el tipo de servicio, debe crear una nueva unidad.

**¿Puedo tener múltiples usuarios administradores?**  
Sí, puede crear múltiples usuarios con rol administrador.

**¿Los choferes pueden ver estadísticas?**  
Los choferes tienen acceso limitado, solo ven sus propios datos.

**¿Cómo recupero mi contraseña?**  
Contacte al administrador para que la restablezca.

**¿Puedo usar el sistema desde mi celular?**  
Sí, el sistema es completamente responsive.

**¿Los reportes PDF incluyen todas las paradas?**  
Sí, el PDF incluye información completa del viaje y todas las paradas.

**¿Qué pasa si no registro todas las llegadas?**  
El sistema no permitirá finalizar el viaje hasta que se registren todas.

**¿Cómo se asigna el estado "En viaje" a las unidades?**  
Automáticamente cuando el chofer inicia un viaje. No puede seleccionarse manualmente al crear o editar tractores/semirremolques.

**¿Puedo asignar un tractor que está "En viaje" a otro viaje?**  
Sí, el sistema lo permite pero mostrará una advertencia. El nuevo viaje no podrá iniciarse hasta que el tractor esté disponible.

**¿Qué pasa con los estados de las unidades cuando finalizo un viaje?**  
Automáticamente vuelven a "Disponible". El tractor y semirremolque quedan listos para ser asignados a nuevos viajes.

**¿Puedo editar el estado de un viaje manualmente?**  
Sí, al editar un viaje existente puede cambiar el estado manualmente. Esto permite correcciones administrativas. Los cambios de estado también actualizan automáticamente los estados de las unidades asignadas.

**¿Qué pasa si intento usar una patente duplicada?**  
El sistema valida en tiempo real mientras escribe. Si la patente ya existe, mostrará un mensaje de error y deshabilitará el botón de guardar.

---

## 17. Glosario

**Chofer**: Conductor asignado a un viaje

**Tractor**: Vehículo motor que arrastra el semirremolque

**Semirremolque**: Remolque sin eje delantero que se acopla al tractor

**Parada**: Registro de ubicación y odómetro durante un viaje

**Odómetro**: Lectura del cuentakilómetros del vehículo en kilómetros

**RTO**: Revisión Técnica Obligatoria

**Alcance**: Clasificación del viaje (Nacional o Internacional)

**Destino**: Ubicación de entrega programada en un viaje

**Estado del Viaje**: Situación actual de un viaje (Programado/En Curso/Finalizado)

**Estado de Unidad**: Situación actual de un tractor o semirremolque:
- Disponible: Listo para asignar
- En viaje: Asignado a viaje en curso (automático)
- En reparación: En mantenimiento
- Fuera de servicio: No operativo

**Estados Automáticos**: Cambios de estado que el sistema realiza sin intervención manual (ej: "En viaje" cuando inicia un viaje)

**Estados Manuales**: Estados que el administrador puede asignar directamente (Disponible, En reparación, Fuera de servicio)

**Validación en Tiempo Real**: Verificación instantánea de datos mientras el usuario escribe (ej: patentes duplicadas)

**Tipo de Servicio**: Clasificación del tipo de carga (Gas Licuado o Combustible Líquido)

**Parada de Inicio**: Primera parada automática al iniciar un viaje

**Parada de Llegada**: Parada registrada al llegar a un destino programado

**Km Comunes**: Kilómetros recorridos en rutas comunes

**Km 100x100**: Kilómetros recorridos en rutas especiales
