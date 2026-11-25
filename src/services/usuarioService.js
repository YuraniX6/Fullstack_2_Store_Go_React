import { authApi } from './api';

// Gestión de usuarios (solo ADMIN) — AuthService, puerto 8080
export const usuarioService = {
  listar: () => authApi.get('/auth/users').then(r => r.data),
  obtener: id => authApi.get(`/auth/users/${id}`).then(r => r.data),
  /** El ADMIN crea un usuario con rol: ADMIN, VENDEDOR o CLIENTE (campo "rol"). */
  crear: usuario => authApi.post('/auth/users', usuario).then(r => r.data),
  actualizar: (id, usuario) => authApi.put(`/auth/users/${id}`, usuario).then(r => r.data),
  eliminar: id => authApi.delete(`/auth/users/${id}`)
};
