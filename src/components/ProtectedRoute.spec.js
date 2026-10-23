import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AllProviders, mount } from '../test/helpers';

const sesion = rol => localStorage.setItem('storego_session', JSON.stringify({ email: 'a@duoc.cl', nombre: 'A', rol }));

describe('ProtectedRoute', () => {
  let view;
  const render = route => {
    view = mount(
      <AllProviders route={route}>
        <Routes>
          <Route path="/login" element={<p>Pantalla login</p>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin', 'vendedor']}><p>Panel privado</p></ProtectedRoute>} />
          <Route path="/admin/solo" element={<ProtectedRoute roles={['admin']}><p>Solo admin</p></ProtectedRoute>} />
        </Routes>
      </AllProviders>
    );
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  it('sin sesión redirige a /login', () => {
    render('/admin');
    expect(view.container.textContent).toBe('Pantalla login');
  });

  it('un administrador entra al panel', () => {
    sesion('admin');
    render('/admin');
    expect(view.container.textContent).toBe('Panel privado');
  });

  it('un vendedor entra al panel', () => {
    sesion('vendedor');
    render('/admin');
    expect(view.container.textContent).toBe('Panel privado');
  });

  it('un vendedor no entra a una ruta solo de administrador', () => {
    sesion('vendedor');
    render('/admin/solo');
    expect(view.container.textContent).toBe('Pantalla login');
  });

  it('un cliente no entra al panel', () => {
    sesion('cliente');
    render('/admin');
    expect(view.container.textContent).toBe('Pantalla login');
  });
});
