# StoreGo (React)

Frontend de StoreGo hecho con React 18 + Vite + React Router + Bootstrap 5, con pruebas Jasmine + Karma (esbuild, sin Babel).

## Uso
```bash
npm install
npm run dev            # desarrollo -> http://localhost:5173
npm run build          # producción
npm test               # Karma + Jasmine (requiere Google Chrome instalado)
npm run test:coverage  # pruebas + reporte de cobertura en coverage/html/index.html
```

Cuentas de prueba: `admin@duoc.cl` / `admin123` y `vendedor@duoc.cl` / `vend123`.

## Estructura
- `src/pages/`: una página por vista.
- `src/components/`: Header, Footer, ProductCard, ProductGrid, Field, formularios y rutas protegidas.
- `src/context/`: carrito, sesión, productos y avisos (Context API).
- `src/hooks/useForm.js`: validación de formularios en tiempo real.
- `src/utils/`: validaciones, formato de precios y manejo de imágenes.
- `src/test/helpers.js`: utilidades compartidas por las pruebas.
- `*.spec.js`: 98 pruebas unitarias, junto al código que prueban.

## Bootstrap
Grilla (`row`, `col-*`), navbar desplegable (`navbar-expand-md`), formularios (`form-control`, `is-invalid`), tablas (`table-responsive`) y botones. Los estilos propios (tema oscuro) están en `src/index.css`.

## Panel admin
- `/admin/productos`: listado de productos (los creados se pueden eliminar).
- `/admin/producto-nuevo`: nombre, categoría, precio, stock, descripción e imagen.
- Los datos se guardan en `localStorage` (no hay backend para la segunda entrega).

