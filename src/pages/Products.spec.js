import Products from './Products';
import { AllProviders, mount, click, flush, stubCatalogo, PRODUCTOS_BASE } from '../test/helpers';

describe('Página Productos (filtro por categoría)', () => {
  let view;
  const render = async route => {
    view = mount(<AllProviders route={route}><Products /></AllProviders>);
    await flush(); // espera al catálogo simulado
  };
  const cards = () => view.container.querySelectorAll('.product-card').length;
  const chip = name => [...view.container.querySelectorAll('.chip')].find(c => c.textContent === name);

  beforeEach(() => {
    localStorage.clear();
    stubCatalogo(PRODUCTOS_BASE);
  });
  afterEach(() => view.unmount());

  it('muestra todos los productos y 6 filtros (Todos + 5 categorías)', async () => {
    await render('/productos');
    expect(cards()).toBe(3);
    expect(view.container.querySelectorAll('.chip').length).toBe(6);
    expect(chip('Todos').className).toContain('active');
  });

  it('filtra por la categoría elegida', async () => {
    await render('/productos');
    click(chip('Consolas'));
    expect(cards()).toBe(3);
    expect(chip('Consolas').className).toContain('active');
  });

  it('muestra un mensaje cuando la categoría no tiene productos', async () => {
    await render('/productos');
    click(chip('Controles'));
    expect(cards()).toBe(0);
    expect(view.container.querySelector('.carrito-vacio').textContent).toContain('No hay productos');
  });

  it('respeta la categoría de la URL y puede volver a Todos', async () => {
    await render('/productos?cat=Controles');
    expect(chip('Controles').className).toContain('active');
    expect(cards()).toBe(0);
    click(chip('Todos'));
    expect(cards()).toBe(3);
  });

  it('incluye los productos que entrega el catálogo (por ejemplo, los creados por el administrador)', async () => {
    stubCatalogo([
      ...PRODUCTOS_BASE,
      { id: 4, name: 'Control DualSense', category: 'Controles', price: 69990, stock: 4, desc: 'Inalámbrico', img: 'x' }
    ]);
    await render('/productos?cat=Controles');
    expect(cards()).toBe(1);
    expect(view.container.querySelector('h3').textContent).toBe('Control DualSense');
  });
});
