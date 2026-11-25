import { authApi, tokens } from './api';

// Sesión que usa la interfaz: { email, nombre, rol } con el rol en minúsculas (admin, vendedor, cliente).
const aSesion = data => ({
  email: data.email,
  nombre: data.nombre || data.username,
  rol: (data.roles?.[0] || 'CLIENTE').toLowerCase()
});

// Autenticación (AuthService, puerto 8080)
export const authService = {
  /** Inicia sesión con el correo, guarda los tokens y devuelve la sesión. */
  login: async (email, password) => {
    const { data } = await authApi.post('/auth/login', { username: email, password });
    tokens.guardar(data.token, data.refreshToken);
    return aSesion(data);
  },
  /** Registro público: siempre crea un CLIENTE. No inicia sesión. */
  registro: datos => authApi.post('/auth/register', datos).then(r => r.data),
  me: () => authApi.get('/auth/me').then(r => r.data)
};
