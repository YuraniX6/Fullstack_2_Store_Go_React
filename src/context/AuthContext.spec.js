import { act } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { mount } from '../test/helpers';

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

  it('parte sin sesión y con las 2 cuentas de prueba', () => {
    render();
    expect(api.session).toBeNull();
    expect(api.users.length).toBe(2);
  });

  it('inicia sesión con credenciales correctas y guarda la sesión', () => {
    const setItem = spyOn(Storage.prototype, 'setItem').and.callThrough();
    render();
    let user;
    act(() => { user = api.login('admin@duoc.cl', 'admin123'); });
    expect(user.rol).toBe('admin');
    expect(api.session.email).toBe('admin@duoc.cl');
    expect(setItem).toHaveBeenCalledWith('storego_session', jasmine.any(String));
  });

  it('rechaza credenciales incorrectas', () => {
    render();
    let user;
    act(() => { user = api.login('admin@duoc.cl', 'mala'); });
    expect(user).toBeNull();
    expect(api.session).toBeNull();
  });

  it('cierra la sesión y borra lo guardado (mock de Storage.removeItem)', () => {
    const removeItem = spyOn(Storage.prototype, 'removeItem').and.callThrough();
    render();
    act(() => { api.login('vendedor@duoc.cl', 'vend123'); });
    act(() => api.logout());
    expect(api.session).toBeNull();
    expect(removeItem).toHaveBeenCalledWith('storego_session');
  });

  it('registra un usuario nuevo y permite iniciar sesión con él', () => {
    render();
    act(() => api.registerUser({ nombre: 'Ana', apellidos: 'Pérez', email: 'ana@gmail.com', password: 'abcd', rol: 'cliente' }));
    expect(api.users.length).toBe(3);
    expect(JSON.parse(localStorage.getItem('storego_users')).length).toBe(1);
    let user;
    act(() => { user = api.login('ana@gmail.com', 'abcd'); });
    expect(user.rol).toBe('cliente');
  });

  it('restaura la sesión guardada', () => {
    localStorage.setItem('storego_session', JSON.stringify({ email: 'x@duoc.cl', nombre: 'X', rol: 'admin' }));
    render();
    expect(api.session.email).toBe('x@duoc.cl');
  });

  it('no falla si lo guardado está corrupto', () => {
    localStorage.setItem('storego_session', '{no es json');
    localStorage.setItem('storego_users', 'tampoco');
    render();
    expect(api.session).toBeNull();
    expect(api.users.length).toBe(2);
  });
});
