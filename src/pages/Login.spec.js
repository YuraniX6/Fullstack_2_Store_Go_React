import { act } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import { AllProviders, mount, setValue, submit, blur } from '../test/helpers';

describe('Página Login', () => {
  let view;
  const render = () => {
    view = mount(
      <AllProviders route="/login">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<p>Panel admin</p>} />
          <Route path="/" element={<p>Inicio</p>} />
        </Routes>
      </AllProviders>
    );
  };
  const q = s => view.container.querySelector(s);
  const toast = () => q('.sg-toast').textContent;
  const fill = (email, pass) => { setValue(q('#email'), email); setValue(q('#password'), pass); };

  beforeEach(() => {
    localStorage.clear();
    jasmine.clock().install();
  });
  afterEach(() => {
    jasmine.clock().uninstall();
    view.unmount();
  });

  it('al enviar vacío marca los campos y avisa', () => {
    render();
    submit(q('form'));
    const errors = [...view.container.querySelectorAll('.invalid-feedback')].map(e => e.textContent);
    expect(errors).toEqual(['Este campo es obligatorio', 'Este campo es obligatorio']);
    expect(q('#email').className).toContain('is-invalid');
    expect(toast()).toBe('Revisa los campos marcados en rojo');
  });

  it('rechaza un correo de dominio no permitido', () => {
    render();
    setValue(q('#email'), 'ana@hotmail.com');
    blur(q('#email'));
    expect(q('#email-error').textContent).toContain('Solo correos');
  });

  it('avisa si el correo o la contraseña no coinciden con ninguna cuenta', () => {
    render();
    fill('nadie@gmail.com', 'abcd');
    submit(q('form'));
    expect(toast()).toBe('Correo o contraseña incorrectos');
  });

  it('con credenciales correctas da la bienvenida y entra al panel', () => {
    render();
    fill('admin@duoc.cl', 'admin123');
    submit(q('form'));
    expect(toast()).toBe('Bienvenido, Administrador');
    act(() => jasmine.clock().tick(900));
    expect(q('p').textContent).toBe('Panel admin');
    expect(JSON.parse(localStorage.getItem('storego_session')).rol).toBe('admin');
  });
});
