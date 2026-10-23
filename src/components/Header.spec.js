import Header from './Header';
import { AllProviders, mount, click } from '../test/helpers';

const SESSION = { email: 'admin@duoc.cl', nombre: 'Administrador', rol: 'admin' };

describe('Header (navbar Bootstrap)', () => {
  let view;
  const render = () => { view = mount(<AllProviders><Header /></AllProviders>); };

  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  const links = () => [...view.container.querySelectorAll('.nav-link')].map(a => a.textContent);

  it('sin sesión muestra los enlaces públicos', () => {
    render();
    expect(links()).toEqual(['Inicio', 'Productos', 'Contacto', 'Iniciar sesión', 'Registrarse']);
  });

  it('usa las clases de navbar de Bootstrap', () => {
    render();
    expect(view.container.querySelector('nav').className).toContain('navbar-expand-md');
    expect(view.container.querySelector('#mainNav').className).toContain('navbar-collapse');
  });

  it('el contador del carrito suma las cantidades guardadas', () => {
    localStorage.setItem('storego_cart', JSON.stringify([{ id: 'ps5', qty: 2 }, { id: 'ps4', qty: 1 }]));
    render();
    expect(view.container.querySelector('.cart-count').textContent).toBe('3');
    expect(view.container.querySelector('.cart-icon-img').getAttribute('src')).toContain('carrito_ocupado');
  });

  it('con el carrito vacío muestra 0 y el ícono vacío', () => {
    render();
    expect(view.container.querySelector('.cart-count').textContent).toBe('0');
    expect(view.container.querySelector('.cart-icon-img').getAttribute('src')).toContain('carrito_vacio');
  });

  it('el botón de menú abre y cierra el menú (clase show)', () => {
    render();
    const nav = view.container.querySelector('#mainNav');
    expect(nav.className).not.toContain('show');
    click(view.container.querySelector('#menuToggle'));
    expect(nav.className).toContain('show');
    click(view.container.querySelector('#menuToggle'));
    expect(nav.className).not.toContain('show');
  });

  it('con sesión de administrador muestra Panel y Salir', () => {
    localStorage.setItem('storego_session', JSON.stringify(SESSION));
    render();
    expect(links()).toContain('Panel');
    expect(links()).toContain('Salir (Administrador)');
    expect(links()).not.toContain('Iniciar sesión');
  });

  it('un cliente no ve el enlace Panel', () => {
    localStorage.setItem('storego_session', JSON.stringify({ ...SESSION, rol: 'cliente' }));
    render();
    expect(links()).not.toContain('Panel');
  });

  it('Salir cierra la sesión (mock de Storage.removeItem) y vuelve a mostrar Iniciar sesión', () => {
    localStorage.setItem('storego_session', JSON.stringify(SESSION));
    const removeItem = spyOn(Storage.prototype, 'removeItem').and.callThrough();
    render();
    const salir = [...view.container.querySelectorAll('.nav-link')].find(a => a.textContent.startsWith('Salir'));
    click(salir);
    expect(removeItem).toHaveBeenCalledWith('storego_session');
    expect(links()).toContain('Iniciar sesión');
  });
});
