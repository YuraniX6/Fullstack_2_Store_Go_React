import Products from './Products';
import { AllProviders, mount, click } from '../test/helpers';

describe('Página Productos (filtro por categoría)', () => {
  let view;
  const render = route => { view = mount(<AllProviders route={route}><Products /></AllProviders>); };
  const cards = () => view.container.querySelectorAll('.product-card').length;
  const chip = name => [...view.container.querySelectorAll('.chip')].find(c => c.textContent === name);

  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  it('muestra todos los productos y 6 filtros (Todos + 5 categorías)', () => {
    render('/productos');
    expect(cards()).toBe(3);
    expect(view.container.querySelectorAll('.chip').length).toBe(6);
    expect(chip('Todos').className).toContain('active');
  });

  it('filtra por la categoría elegida', () => {
    render('/productos');
    click(chip('Consolas'));
    expect(cards()).toBe(3);
    expect(chip('Consolas').className).toContain('active');
  });

  it('muestra un mensaje cuando la categoría no tiene productos', () => {
    render('/productos');
    click(chip('Controles'));
    expect(cards()).toBe(0);
    expect(view.container.querySelector('.carrito-vacio').textContent).toContain('No hay productos');
  });

  it('respeta la categoría de la URL y puede volver a Todos', () => {
    render('/productos?cat=Controles');
    expect(chip('Controles').className).toContain('active');
    expect(cards()).toBe(0);
    click(chip('Todos'));
    expect(cards()).toBe(3);
  });

  it('incluye los productos creados por el administrador', () => {
    localStorage.setItem('storego_products', JSON.stringify([
      { id: 'p-1', name: 'Control DualSense', category: 'Controles', price: 69990, stock: 4, desc: 'Inalámbrico', img: 'x', custom: true }
    ]));
    render('/productos?cat=Controles');
    expect(cards()).toBe(1);
    expect(view.container.querySelector('h3').textContent).toBe('Control DualSense');
  });
});
