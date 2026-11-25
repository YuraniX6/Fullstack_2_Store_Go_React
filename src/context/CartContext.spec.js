import { act } from 'react';
import { ToastProvider } from './ToastContext';
import { ProductsProvider } from './ProductsContext';
import { CartProvider, useCart } from './CartContext';
import { mount, flush, stubCatalogo, PRODUCTOS_BASE } from '../test/helpers';

describe('CartContext', () => {
  let api;
  let view;

  function Probe() {
    api = useCart();
    return null;
  }

  const render = async () => {
    stubCatalogo(PRODUCTOS_BASE);
    view = mount(
      <ToastProvider>
        <ProductsProvider>
          <CartProvider>
            <Probe />
          </CartProvider>
        </ProductsProvider>
      </ToastProvider>
    );
    await flush(); // espera a que el catálogo simulado cargue los productos
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  it('parte vacío', async () => {
    await render();
    expect(api.items).toEqual([]);
    expect(api.count).toBe(0);
    expect(api.total).toBe(0);
  });

  it('suma la cantidad si el producto ya estaba y calcula el total', async () => {
    await render();
    act(() => api.addToCart(1));
    act(() => api.addToCart(1, 2));
    expect(api.items.length).toBe(1);
    expect(api.items[0].qty).toBe(3);
    expect(api.count).toBe(3);
    expect(api.total).toBe(2700000);
  });

  it('guarda el carrito en localStorage (mock de Storage.setItem)', async () => {
    const setItem = spyOn(Storage.prototype, 'setItem').and.callThrough();
    await render();
    act(() => api.addToCart(2));
    expect(setItem).toHaveBeenCalledWith('storego_cart', JSON.stringify([{ id: 2, qty: 1 }]));
  });

  it('muestra un aviso al añadir un producto', async () => {
    await render();
    act(() => api.addToCart(3));
    expect(view.container.querySelector('.sg-toast').textContent).toBe('PlayStation 3 añadido al carrito');
  });

  it('ignora productos que no existen', async () => {
    await render();
    act(() => api.addToCart('no-existe'));
    expect(api.count).toBe(0);
  });

  it('changeQty suma y resta, y quita el producto al llegar a 0', async () => {
    await render();
    act(() => api.addToCart(1));
    act(() => api.changeQty(1, 1));
    expect(api.items[0].qty).toBe(2);
    act(() => api.changeQty(1, -2));
    expect(api.items.length).toBe(0);
  });

  it('removeFromCart y clearCart vacían el carrito', async () => {
    await render();
    act(() => { api.addToCart(1); api.addToCart(2); });
    act(() => api.removeFromCart(1));
    expect(api.items.map(i => i.id)).toEqual([2]);
    act(() => api.clearCart());
    expect(api.items).toEqual([]);
  });

  it('recupera el carrito guardado', async () => {
    localStorage.setItem('storego_cart', JSON.stringify([{ id: 3, qty: 2 }]));
    await render();
    expect(api.count).toBe(2);
    expect(api.total).toBe(140000);
  });

  it('si el carrito guardado está corrupto, parte vacío', async () => {
    localStorage.setItem('storego_cart', '{no es json');
    await render();
    expect(api.items).toEqual([]);
  });
});
