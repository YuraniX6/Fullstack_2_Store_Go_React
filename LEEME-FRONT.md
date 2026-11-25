# Conexión del frontend con el backend (patrón de la guía del profesor)

Solo se cambió **cómo se conecta**: la interfaz, los estilos, las validaciones y las páginas siguen igual.

## Cómo está conectado
```
Página / componente → contexto (AuthContext, ProductsContext) → servicio → api.js (axios + token) → microservicio
```
| Pieza | Archivo | Para qué |
|---|---|---|
| Cliente HTTP | `src/services/api.js` | URL base de cada servicio, token JWT en cada petición (interceptor), renovación con el refresh token si responde 401, `mensajeDeError` |
| Servicios | `authService`, `usuarioService`, `productoService`, `categoriaService`, `ordenService` | Una función por endpoint (igual que en el proyecto del profesor) |
| Hook | `src/hooks/useCarga.js` | Estados cargando / datos / error (el mismo del profesor) |

| Microservicio | Puerto | Rutas | Servicio del front |
|---|---|---|---|
| AuthService | 8080 | `/api/v1/auth` | `authService`, `usuarioService` |
| CatalogService | 8083 | `/api/v1/products`, `/api/v1/categories` | `productoService`, `categoriaService` |
| OrderService | 8084 | `/api/v1/orders` | `ordenService` |

Las URLs se pueden cambiar con `.env` (copia `.env.example`; reinicia `npm run dev` después).
La diferencia con el proyecto del profesor: él tiene **un** backend y **una** instancia de axios; aquí hay un backend por servicio, así que `api.js` crea **una instancia por servicio** y las tres comparten los mismos interceptores.

## Cómo usarlo
1. `npm install axios` (el front no lo tenía).
2. Copia la carpeta `src` de este zip sobre la del proyecto (y `.env.example` en la raíz).
3. Levanta primero el backend (`docker compose up -d --build`) y después `npm run dev` (http://localhost:5173, que CORS ya permite).
4. Cuentas de demostración (si el backend tiene `SEED_DEMO_USERS=true`): `admin@duoc.cl` / `admin123`, `vendedor@duoc.cl` / `vend123`.

## Qué cambió en cada archivo
| Archivo | Cambio |
|---|---|
| `context/AuthContext.jsx` | `login` y `registerUser` llaman a AuthService; la sesión y los tokens quedan en `localStorage` (sobreviven a recargas); si el token vence y no se renueva, se cierra la sesión |
| `context/ProductsContext.jsx` | Los productos vienen de CatalogService (ya no hay productos base locales) |
| `pages/Login.jsx`, `components/RegisterForm.jsx`, `components/ProductForm.jsx` | El envío es asíncrono; los errores del backend (correo/RUN/nombre repetido, sin conexión) se muestran como antes |
| `pages/Cart.jsx` | "Finalizar compra" crea la boleta en OrderService (exige sesión) y vuelve a pedir el catálogo porque el stock cambió |
| `pages/AdminProducts.jsx`, `App.jsx` | El vendedor solo ve la lista; crear y eliminar productos es solo del administrador |
| `pages/AdminDashboard.jsx` | La cantidad de usuarios se pide al backend y solo se muestra al administrador |
| `pages/ProductDetail.jsx` | El id de la URL se compara como texto (los ids ahora son numéricos) |
| Specs | Actualicé 9 archivos de prueba para simular los servicios en lugar de `localStorage` |

## Pruebas
Con los cambios corrí las pruebas de Karma: **111 de 111 pasan** (98 originales más las de la pantalla de órdenes). Ninguna llama al backend real.

## Pantalla de órdenes (`/admin/ordenes`)
Roles `admin` y `vendedor`, en el menú "Órdenes":
- **Vendedor:** lista de boletas y detalle (botón "Ver"). No ve botones de cambiar estado ni eliminar.
- **Administrador:** además cambia el estado (Marcar enviada, Marcar entregada, Cancelar; solo las transiciones permitidas) y elimina boletas canceladas.
- El menú "Nuevo producto" ahora solo aparece al administrador, como pide el enunciado.

## Lo que NO se hizo
- Administración de categorías en pantalla (los servicios ya existen en `categoriaService`).
- Pantalla de "Mis compras" para el cliente (`ordenService.mias()` ya existe).
