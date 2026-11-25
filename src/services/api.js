import axios from 'axios';

// ============================================================================
//  Cliente HTTP de la aplicación
// ----------------------------------------------------------------------------
//  - El backend son microservicios, cada uno en su puerto y con rutas /api/v1:
//      AuthService     8080  /api/v1/auth
//      CatalogService  8083  /api/v1/products y /api/v1/categories
//      OrderService    8084  /api/v1/orders
//    Hay una instancia de axios por servicio; las tres comparten los interceptores.
//  - Interceptor de petición: agrega "Authorization: Bearer <token>".
//  - Interceptor de respuesta: si el backend responde 401 (token vencido), pide un
//    token nuevo con el refresh token y repite la petición UNA vez. Si eso también
//    falla, borra los tokens y avisa a AuthContext para cerrar la sesión.
// ============================================================================

const env = import.meta.env || {};

/** URL base de cada servicio. Se pueden cambiar con VITE_*_URL en el archivo .env */
export const AUTH_URL = env.VITE_AUTH_URL || 'http://localhost:8080/api/v1';
export const CATALOG_URL = env.VITE_CATALOG_URL || 'http://localhost:8083/api/v1';
export const ORDER_URL = env.VITE_ORDER_URL || 'http://localhost:8084/api/v1';

export const EVENTO_SESION_EXPIRADA = 'storego:sesion-expirada';
const CLAVE_ACCESS = 'storego_access_token';
const CLAVE_REFRESH = 'storego_refresh_token';

function leer(clave) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

/** Tokens guardados en localStorage: así la sesión sobrevive a recargas de página. */
export const tokens = {
  get access() {
    return leer(CLAVE_ACCESS);
  },
  get refresh() {
    return leer(CLAVE_REFRESH);
  },
  guardar(access, refresh) {
    try {
      localStorage.setItem(CLAVE_ACCESS, access);
      if (refresh) localStorage.setItem(CLAVE_REFRESH, refresh);
    } catch {
      /* almacenamiento no disponible */
    }
  },
  borrar() {
    try {
      localStorage.removeItem(CLAVE_ACCESS);
      localStorage.removeItem(CLAVE_REFRESH);
    } catch {
      /* ignorar */
    }
  }
};

const crearCliente = baseURL => axios.create({ baseURL, timeout: 15000 });

export const authApi = crearCliente(AUTH_URL);
export const catalogApi = crearCliente(CATALOG_URL);
export const ordersApi = crearCliente(ORDER_URL);

// Si varias peticiones reciben 401 a la vez, todas esperan la MISMA renovación.
let renovacionEnCurso = null;

export function renovarSesion() {
  if (!renovacionEnCurso) {
    renovacionEnCurso = axios
      .post(`${AUTH_URL}/auth/refresh`, { refreshToken: tokens.refresh })
      .then(({ data }) => {
        tokens.guardar(data.token, data.refreshToken);
        return data;
      })
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso;
}

function expirarSesion() {
  tokens.borrar();
  window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
}

export function configurarInterceptores(instancia) {
  instancia.interceptors.request.use(config => {
    const access = tokens.access;
    if (access) config.headers.Authorization = `Bearer ${access}`;
    return config;
  });

  instancia.interceptors.response.use(
    respuesta => respuesta,
    async error => {
      const original = error.config;
      // login/registro/refresh responden 401 por credenciales: ahí no se intenta renovar
      const esAuth = /\/auth\/(login|register|refresh)/.test(original?.url || '');
      if (error.response?.status === 401 && original && !esAuth) {
        if (!original._reintento && tokens.access && tokens.refresh) {
          original._reintento = true;
          try {
            await renovarSesion();
            return instancia(original); // repite con el token nuevo
          } catch {
            expirarSesion();
          }
        } else {
          expirarSesion();
        }
      }
      return Promise.reject(error);
    }
  );
}

[authApi, catalogApi, ordersApi].forEach(configurarInterceptores);

/** Mensaje legible para mostrar al usuario a partir de un error de axios. */
export function mensajeDeError(error, porDefecto = 'Ocurrió un error inesperado. Intenta nuevamente.') {
  const data = error?.response?.data;
  if (data?.message) return data.message; // Catalog y Order: { status, message }
  if (data?.error) return data.error; // Auth: { error, status }
  if (data?.errors) return Object.values(data.errors)[0] || porDefecto; // Auth: validación por campo
  if (error?.response) return porDefecto;
  if (error?.request || error?.code === 'ERR_NETWORK') {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
  }
  return error?.message || porDefecto;
}

/** Errores por campo que devuelve AuthService cuando falla la validación (400). */
export const erroresDeCampos = error => error?.response?.data?.errors || {};
