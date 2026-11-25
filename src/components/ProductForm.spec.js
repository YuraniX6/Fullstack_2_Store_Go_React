import { act } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProductForm from './ProductForm';
import { productoService } from '../services/productoService';
import { AllProviders, mount, setValue, submit, flush, stubCatalogo, PRODUCTOS_BASE } from '../test/helpers';

describe('ProductForm', () => {
  let view;
  const q = s => view.container.querySelector(s);
  const render = async () => {
    stubCatalogo(PRODUCTOS_BASE);
    view = mount(
      <AllProviders route="/admin/producto-nuevo">
        <Routes>
          <Route path="/admin/producto-nuevo" element={<ProductForm />} />
          <Route path="/admin/productos" element={<p>Listado de productos</p>} />
        </Routes>
      </AllProviders>
    );
    await flush(); // espera al catálogo simulado (se usa para detectar nombres repetidos)
  };
  const fill = (v = {}) => {
    const d = { name: 'Control DualSense', category: 'Controles', price: '69990', stock: '5', desc: 'Control inalámbrico', ...v };
    Object.entries(d).forEach(([k, val]) => setValue(q('#' + k), val));
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  it('usa la grilla de Bootstrap (row g-3) y campos form-control', async () => {
    await render();
    expect(q('form .row.g-3')).not.toBeNull();
    expect(q('#name').className).toContain('form-control');
    expect(q('#category').className).toContain('form-select');
  });

  it('al enviar vacío muestra un error en cada campo obligatorio', async () => {
    await render();
    submit(q('form'));
    const errors = [...view.container.querySelectorAll('.invalid-feedback')].map(e => e.textContent).filter(Boolean);
    expect(errors.length).toBe(5);
    expect(q('.sg-toast').textContent).toBe('Revisa los campos marcados en rojo');
  });

  it('valida que el precio sea numérico', async () => {
    await render();
    setValue(q('#price'), 'abc');
    expect(q('#price-error').textContent).toBe('Ingresa solo números, sin puntos ni signos');
  });

  it('no permite repetir el nombre de un producto', async () => {
    spyOn(productoService, 'crear');
    await render();
    fill({ name: 'playstation 5' });
    submit(q('form'));
    await flush();
    expect(q('#name-error').textContent).toBe('Ya existe un producto con este nombre');
    expect(productoService.crear).not.toHaveBeenCalled();
  });

  it('rechaza un archivo que no es imagen', async () => {
    await render();
    const input = q('#imagen');
    Object.defineProperty(input, 'files', { value: [new File(['x'], 'a.txt', { type: 'text/plain' })] });
    act(() => { input.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(view.container.textContent).toContain('El archivo debe ser una imagen');
  });

  it('con datos válidos envía el producto al backend y vuelve al listado', async () => {
    spyOn(productoService, 'crear').and.resolveTo({ id: 4 });
    await render();
    fill();
    submit(q('form'));
    await flush();
    const enviado = productoService.crear.calls.mostRecent().args[0];
    expect(enviado).toEqual(jasmine.objectContaining({ name: 'Control DualSense', category: 'Controles', price: 69990, stock: 5 }));
    expect(enviado.img).toContain('data:image');
    expect(q('p').textContent).toBe('Listado de productos');
  });

  it('si el backend responde 409, marca el nombre como repetido', async () => {
    spyOn(productoService, 'crear').and.rejectWith({ response: { status: 409 } });
    await render();
    fill();
    submit(q('form'));
    await flush();
    expect(q('#name-error').textContent).toBe('Ya existe un producto con este nombre');
  });

  it('si el backend falla por otro motivo, avisa con el mensaje del servidor', async () => {
    spyOn(productoService, 'crear').and.rejectWith({ response: { status: 403, data: { message: 'No tienes permisos para esta acción' } } });
    await render();
    fill();
    submit(q('form'));
    await flush();
    expect(q('.sg-toast').textContent).toBe('No tienes permisos para esta acción');
  });
});
