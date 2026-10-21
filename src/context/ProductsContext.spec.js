import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ProductsProvider, useProducts } from './ProductsContext';
import { PRODUCTS } from '../data/products';

describe('ProductsContext', () => {
  let container;
  let root;
  let api;

  function Probe() {
    api = useProducts();
    return null;
  }

  beforeEach(() => {
    window.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <ProductsProvider>
          <Probe />
        </ProductsProvider>
      );
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const nuevo = {
    name: 'Control DualSense',
    category: 'Controles',
    price: 69990,
    stock: 5,
    desc: 'Control inalámbrico',
    img: 'data:image/png;base64,AAAA'
  };

  it('parte con los productos base', () => {
    expect(api.products.length).toBe(PRODUCTS.length);
  });

  it('agrega un producto nuevo con id y lo marca como personalizado', () => {
    let created;
    act(() => { created = api.addProduct(nuevo); });
    expect(created.id).toMatch(/^p-/);
    expect(created.custom).toBeTrue();
    expect(api.products.length).toBe(PRODUCTS.length + 1);
    expect(api.products.some(p => p.name === 'Control DualSense')).toBeTrue();
  });

  it('guarda los productos nuevos en localStorage', () => {
    act(() => { api.addProduct(nuevo); });
    const saved = JSON.parse(localStorage.getItem('storego_products'));
    expect(saved.length).toBe(1);
    expect(saved[0].category).toBe('Controles');
  });

  it('elimina un producto creado', () => {
    let created;
    act(() => { created = api.addProduct(nuevo); });
    act(() => { api.removeProduct(created.id); });
    expect(api.products.length).toBe(PRODUCTS.length);
    expect(JSON.parse(localStorage.getItem('storego_products'))).toEqual([]);
  });
});
