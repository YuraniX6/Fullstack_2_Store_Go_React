import AdminProducts from './AdminProducts';
import { AllProviders, mount, click } from '../test/helpers';

const CUSTOM = { id: 'p-1', name: 'Control DualSense', category: 'Controles', price: 69990, stock: 4, desc: 'Inalámbrico', img: 'x', custom: true };

describe('Página AdminProducts (tabla Bootstrap)', () => {
  let view;
  const render = () => { view = mount(<AllProviders><AdminProducts /></AllProviders>); };
  const rows = () => view.container.querySelectorAll('tbody tr');

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('storego_products', JSON.stringify([CUSTOM]));
  });
  afterEach(() => view.unmount());

  it('usa una tabla responsive de Bootstrap con los productos base y los creados', () => {
    render();
    expect(view.container.querySelector('.table-responsive table.table.table-hover')).not.toBeNull();
    expect(rows().length).toBe(4);
    expect(view.container.textContent).toContain('$69.990');
  });

  it('los productos base se marcan como Base y no se pueden eliminar', () => {
    render();
    expect(view.container.querySelectorAll('tbody .btn-outline-danger').length).toBe(1);
    expect(view.container.textContent).toContain('Base');
  });

  it('si el usuario cancela la confirmación, no elimina (mock de window.confirm)', () => {
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
    render();
    click(view.container.querySelector('.btn-outline-danger'));
    expect(confirmSpy).toHaveBeenCalledWith('¿Eliminar "Control DualSense"?');
    expect(rows().length).toBe(4);
  });

  it('si confirma, elimina el producto y actualiza el almacenamiento', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    render();
    click(view.container.querySelector('.btn-outline-danger'));
    expect(rows().length).toBe(3);
    expect(JSON.parse(localStorage.getItem('storego_products'))).toEqual([]);
    expect(view.container.querySelector('.sg-toast').textContent).toBe('Producto eliminado');
  });

  it('tiene el botón para crear un producto nuevo', () => {
    render();
    expect(view.container.querySelector('a.btn-primary').getAttribute('href')).toBe('/admin/producto-nuevo');
  });
});
