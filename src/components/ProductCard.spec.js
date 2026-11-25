import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ToastProvider } from '../context/ToastContext';
import { CartProvider } from '../context/CartContext';
import { ProductsProvider } from '../context/ProductsContext';
import { productoService } from '../services/productoService';
import { PRODUCTOS_BASE } from '../test/helpers';

describe('ProductCard', () => {
  let container;
  let root;

  beforeEach(async () => {
    window.IS_REACT_ACT_ENVIRONMENT = true;
    productoService.listar.and.resolveTo(PRODUCTOS_BASE);
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <MemoryRouter>
          <ToastProvider>
            <ProductsProvider>
              <CartProvider>
                <ProductCard product={PRODUCTOS_BASE[0]} />
              </CartProvider>
            </ProductsProvider>
          </ToastProvider>
        </MemoryRouter>
      );
    });
    await act(async () => {
      for (let i = 0; i < 10; i += 1) await Promise.resolve();
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('muestra nombre, descripción y precio', () => {
    expect(container.querySelector('h3').textContent).toBe('PlayStation 5');
    expect(container.querySelector('.product-desc').textContent).toContain('825 GB');
    expect(container.querySelector('.price').textContent).toContain('900');
  });

  it('muestra la categoría del producto', () => {
    expect(container.querySelector('.category-tag').textContent).toBe('Consolas');
  });

  it('enlaza al detalle del producto', () => {
    expect(container.querySelector('h3 a').getAttribute('href')).toBe('/producto/1');
  });

  it('al presionar "Añadir" guarda el producto en el carrito', () => {
    act(() => {
      container.querySelector('.btn-add').click();
    });
    const cart = JSON.parse(localStorage.getItem('storego_cart'));
    expect(cart).toEqual([{ id: 1, qty: 1 }]);
  });
});
