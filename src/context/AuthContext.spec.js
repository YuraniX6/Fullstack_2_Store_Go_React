import { act } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';
import { usuarioService } from '../services/usuarioService';
import { EVENTO_SESION_EXPIRADA, tokens } from '../services/api';
import { mount } from '../test/helpers';

const ADMIN = { email: 'admin@duoc.cl', nombre: 'Administrador', rol: 'admin' };

describe('AuthContext', () => {
  let api;
  let view;

  function Probe() {
    api = useAuth();
    return null;
  }
  const render = () => { view = mount(<AuthProvider><Probe /></AuthProvider>); };

  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  it('parte sin sesión', () => {
    render();
    expect(api.session).toBeNull();
  });

  it('inicia sesión con credenciales correctas y guarda la sesión', async () => {
    spyOn(authService, 'login').and.resolveTo(ADMIN);
    const setItem = spyOn(Storage.prototype, 'setItem').and.callThrough();
    render();
    let user;
    await act(async () => { user = await api.login('admin@duoc.cl', 'admin123'); });
    expect(authService.login).toHaveBeenCalledWith('admin@duoc.cl', 'admin123');
    expect(user.rol).toBe('admin');
    expect(api.session.email).toBe('admin@duoc.cl');
    expect(setItem).toHaveBeenCalledWith('storego_session', jasmine.any(String));
  });

  it('rechaza credenciales incorrectas (401) devolviendo null', async () => {
    spyOn(authService, 'login').and.rejectWith({ response: { status: 401 } });
    render();
    let user;
    await act(async () => { user = await api.login('admin@duoc.cl', 'mala'); });
    expect(user).toBeNull();
    expect(api.session).toBeNull();
  });

  it('si el servidor no responde, el error se propaga', async () => {
    spyOn(authService, 'login').and.rejectWith({ code: 'ERR_NETWORK', request: {} });
    render();
    let error;
    await act(async () => {
      try { await api.login('admin@duoc.cl', 'admin123'); } catch (e) { error = e; }
    });
    expect(error.code).toBe('ERR_NETWORK');
    expect(api.session).toBeNull();
  });

  it('cierra la sesión y borra la sesión y los tokens (mock de Storage.removeItem)', () => {
    tokens.guardar('access', 'refresh');
    localStorage.setItem('storego_session', JSON.stringify(ADMIN));
    const removeItem = spyOn(Storage.prototype, 'removeItem').and.callThrough();
    render();
    act(() => api.logout());
    expect(api.session).toBeNull();
    expect(removeItem).toHaveBeenCalledWith('storego_session');
    expect(tokens.access).toBeNull();
    expect(tokens.refresh).toBeNull();
  });

  it('el registro público envía los datos a AuthService (crea un cliente)', async () => {
    spyOn(authService, 'registro').and.resolveTo({});
    render();
    const datos = { nombre: 'Ana', apellidos: 'Pérez', email: 'ana@gmail.com', password: 'abcd' };
    await act(async () => { await api.registerUser(datos); });
    expect(authService.registro).toHaveBeenCalledWith(datos);
  });

  it('el administrador crea usuarios con rol (POST /auth/users)', async () => {
    spyOn(usuarioService, 'crear').and.resolveTo({});
    render();
    const datos = { nombre: 'Vera', email: 'vera@duoc.cl', password: 'abcd', rol: 'vendedor' };
    await act(async () => { await api.registerUser(datos, { admin: true }); });
    expect(usuarioService.crear).toHaveBeenCalledWith(datos);
  });

  it('restaura la sesión guardada', () => {
    localStorage.setItem('storego_session', JSON.stringify({ email: 'x@duoc.cl', nombre: 'X', rol: 'admin' }));
    render();
    expect(api.session.email).toBe('x@duoc.cl');
  });

  it('no falla si lo guardado está corrupto', () => {
    localStorage.setItem('storego_session', '{no es json');
    render();
    expect(api.session).toBeNull();
  });

  it('cierra la sesión cuando api.js avisa que el token venció y no se pudo renovar', () => {
    localStorage.setItem('storego_session', JSON.stringify(ADMIN));
    render();
    expect(api.session).not.toBeNull();
    act(() => { window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA)); });
    expect(api.session).toBeNull();
  });
});
