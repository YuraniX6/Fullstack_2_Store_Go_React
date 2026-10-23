import { act } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProductForm from './ProductForm';
import { AllProviders, mount, setValue, submit } from '../test/helpers';

describe('ProductForm', () => {
  let view;
  const q = s => view.container.querySelector(s);
  const render = () => {
    view = mount(
      <AllProviders route="/admin/producto-nuevo">
        <Routes>
          <Route path="/admin/producto-nuevo" element={<ProductForm />} />
          <Route path="/admin/productos" element={<p>Listado de productos</p>} />
        </Routes>
      </AllProviders>
    );
  };
  const fill = (v = {}) => {
    const d = { name: 'Control DualSense', category: 'Controles', price: '69990', stock: '5', desc: 'Control inalámbrico', ...v };
    Object.entries(d).forEach(([k, val]) => setValue(q('#' + k), val));
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  it('usa la grilla de Bootstrap (row g-3) y campos form-control', () => {
    render();
    expect(q('form .row.g-3')).not.toBeNull();
    expect(q('#name').className).toContain('form-control');
    expect(q('#category').className).toContain('form-select');
  });

  it('al enviar vacío muestra un error en cada campo obligatorio', () => {
    render();
    submit(q('form'));
    const errors = [...view.container.querySelectorAll('.invalid-feedback')].map(e => e.textContent).filter(Boolean);
    expect(errors.length).toBe(5);
    expect(q('.sg-toast').textContent).toBe('Revisa los campos marcados en rojo');
  });

  it('valida que el precio sea numérico', () => {
    render();
    setValue(q('#price'), 'abc');
    expect(q('#price-error').textContent).toBe('Ingresa solo números, sin puntos ni signos');
  });

  it('no permite repetir el nombre de un producto', () => {
    render();
    fill({ name: 'playstation 5' });
    submit(q('form'));
    expect(q('#name-error').textContent).toBe('Ya existe un producto con este nombre');
  });

  it('rechaza un archivo que no es imagen', () => {
    render();
    const input = q('#imagen');
    Object.defineProperty(input, 'files', { value: [new File(['x'], 'a.txt', { type: 'text/plain' })] });
    act(() => { input.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(view.container.textContent).toContain('El archivo debe ser una imagen');
  });

  it('con datos válidos guarda el producto y vuelve al listado', () => {
    render();
    fill();
    submit(q('form'));
    const saved = JSON.parse(localStorage.getItem('storego_products'));
    expect(saved.length).toBe(1);
    expect(saved[0]).toEqual(jasmine.objectContaining({ name: 'Control DualSense', category: 'Controles', price: 69990, stock: 5, custom: true }));
    expect(saved[0].img).toContain('data:image');
    expect(q('p').textContent).toBe('Listado de productos');
  });
});
