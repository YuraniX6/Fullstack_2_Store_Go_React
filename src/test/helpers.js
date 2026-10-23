import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { ProductsProvider } from '../context/ProductsContext';
import { CartProvider } from '../context/CartContext';

// Envuelve el componente con todos los contextos reales de la app.
export function AllProviders({ children, route = '/' }) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>{children}</CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

// Monta un elemento en un contenedor del DOM y devuelve utilidades para limpiarlo.
export function mount(ui) {
  window.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(ui));
  return {
    container,
    unmount() {
      act(() => root.unmount());
      container.remove();
    }
  };
}

// Escribe en un <input>, <select> o <textarea> controlado por React.
export function setValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  act(() => {
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}

export function click(el) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

export function blur(el) {
  act(() => {
    el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });
}

export function submit(form) {
  act(() => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

export const text = (container, selector) => container.querySelector(selector)?.textContent ?? null;
