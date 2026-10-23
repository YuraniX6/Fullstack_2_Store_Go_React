import { act } from 'react';
import { ToastProvider } from './ToastContext';
import { ProductsProvider } from './ProductsContext';
import { CartProvider, useCart } from './CartContext';
import { mount } from '../test/helpers';

describe('CartContext', () => {
  let api;
  let view;

  function Probe() {
    api = useCart();
    return null;
  }

  const render = () => {
    view = mount(
      <ToastProvider>
        <ProductsProvider>
          <CartProvider>
            <Probe />
          </CartProvider>
        </ProductsProvider>
      </ToastProvider>
    );
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  it('parte vacío', () => {
    render();
    expect(api.items).toEqual([]);
    expect(api.count).toBe(0);
    expect(api.total).toBe(0);
  });

  it('suma la cantidad si el producto ya estaba y calcula el total', () => {
    render();
    act(() => api.addToCart('ps5'));
    act(() => api.addToCart('ps5', 2));
    expect(api.items.length).toBe(1);
    expect(api.items[0].qty).toBe(3);
    expect(api.count).toBe(3);
    expect(api.total).toBe(2700000);
  });

  it('guarda el carrito en localStorage (mock de Storage.setItem)', () => {
    const setItem = spyOn(Storage.prototype, 'setItem').and.callThrough();
    render();
    act(() => api.addToCart('ps4'));
    expect(setItem).toHaveBeenCalledWith('storego_cart', JSON.stringify([{ id: 'ps4', qty: 1 }]));
  });

  it('muestra un aviso al añadir un producto', () => {
    render();
    act(() => api.addToCart('ps3'));
    expect(view.container.querySelector('.sg-toast').textContent).toBe('PlayStation 3 añadido al carrito');
  });

  it('ignora productos que no existen', () => {
    render();
    act(() => api.addToCart('no-existe'));
    expect(api.count).toBe(0);
  });

  it('changeQty suma y resta, y quita el producto al llegar a 0', () => {
    render();
    act(() => api.addToCart('ps5'));
    act(() => api.changeQty('ps5', 1));
    expect(api.items[0].qty).toBe(2);
    act(() => api.changeQty('ps5', -2));
    expect(api.items.length).toBe(0);
  });

  it('removeFromCart y clearCart vacían el carrito', () => {
    render();
    act(() => { api.addToCart('ps5'); api.addToCart('ps4'); });
    act(() => api.removeFromCart('ps5'));
    expect(api.items.map(i => i.id)).toEqual(['ps4']);
    act(() => api.clearCart());
    expect(api.items).toEqual([]);
  });

  it('recupera el carrito guardado', () => {
    localStorage.setItem('storego_cart', JSON.stringify([{ id: 'ps3', qty: 2 }]));
    render();
    expect(api.count).toBe(2);
    expect(api.total).toBe(140000);
  });

  it('si el carrito guardado está corrupto, parte vacío', () => {
    localStorage.setItem('storego_cart', '{no es json');
    render();
    expect(api.items).toEqual([]);
  });
});
