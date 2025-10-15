# Instalación de Dependencias para Generación de PDF

Para que funcione la generación de PDFs en el reporte de viajes, necesitas instalar las siguientes dependencias:

## Instalar paquetes

Ejecuta el siguiente comando en la carpeta del frontend (RutaControl):

```bash
npm install jspdf jspdf-autotable
```

O si usas pnpm:

```bash
pnpm add jspdf jspdf-autotable
```

O si usas yarn:

```bash
yarn add jspdf jspdf-autotable
```

## Paquetes instalados

- **jspdf**: Librería para generar documentos PDF en JavaScript
- **jspdf-autotable**: Plugin para jsPDF que permite crear tablas automáticamente

## Verificar instalación

Después de instalar, verifica que los paquetes estén en tu `package.json`:

```json
{
  "dependencies": {
    ...
    "jspdf": "^2.x.x",
    "jspdf-autotable": "^3.x.x"
  }
}
```

## Reiniciar el servidor

Después de instalar, reinicia el servidor de desarrollo:

```bash
npm run dev
```

¡Listo! Ahora podrás generar PDFs con toda la información del viaje.
