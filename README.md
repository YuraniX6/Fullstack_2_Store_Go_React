# StoreGo (React)

Frontend StoreGo migrado a React + Vite + React Router, con pruebas Jasmine + Karma (esbuild, sin Babel).

## Uso
```bash
npm install
npm run dev      # desarrollo -> http://localhost:5173
npm run build    # producción
npm test         # Karma + Jasmine (requiere Google Chrome instalado)
```

Cuentas de prueba: `admin@duoc.cl` / `admin123` y `vendedor@duoc.cl` / `vend123`.

## Panel admin
- `/admin/productos`: listado de productos (los creados se pueden eliminar).
- `/admin/producto-nuevo`: formulario con nombre, categoría, precio, stock, descripción e imagen.
- Los productos creados se guardan en `localStorage` y aparecen en la tienda.
