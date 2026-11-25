import AdminProducts from './AdminProducts';
import { productoService } from '../services/productoService';
import { AllProviders, mount, click, flush, stubCatalogo, PRODUCTOS_BASE } from '../test/helpers';

const NUEVO = { id: 4, name: 'Control DualSense', category: 'Controles', price: 69990, stock: 4, desc: 'Inalámbrico', img: 'x' };
const sesion = rol => localStorage.setItem('storego_session', JSON.stringify({ email: 'a@duoc.cl', nombre: 'A', rol }));

describe('Página AdminProducts (tabla Bootstrap)', () => {
  let view;
  const render = async () => {
    view = mount(<AllProviders><AdminProducts /></AllProviders>);
    await flush();
  };
  const rows = () => view.container.querySelectorAll('tbody tr');

  beforeEach(() => {
    localStorage.clear();
    stubCatalogo([...PRODUCTOS_BASE, NUEVO]);
  });
  afterEach(() => view.unmount());

  it('usa una tabla responsive de Bootstrap con los productos del catálogo', async () => {
    sesion('admin');
    await render();
    expect(view.container.querySelector('.table-responsive table.table.table-hover')).not.toBeNull();
    expect(rows().length).toBe(4);
    expect(view.container.textContent).toContain('$69.990');
  });

  it('el administrador puede eliminar cualquier producto y crear uno nuevo', async () => {
    sesion('admin');
    await render();
    expect(view.container.querySelectorAll('tbody .btn-outline-danger').length).toBe(4);
    expect(view.container.querySelector('a.btn-primary').getAttribute('href')).toBe('/admin/producto-nuevo');
  });

  it('el vendedor solo ve la lista: sin botón de eliminar ni de crear', async () => {
    sesion('vendedor');
    await render();
    expect(rows().length).toBe(4);
    expect(view.container.querySelectorAll('tbody .btn-outline-danger').length).toBe(0);
    expect(view.container.querySelector('a.btn-primary')).toBeNull();
  });

  it('si el usuario cancela la confirmación, no elimina (mock de window.confirm)', async () => {
    sesion('admin');
    spyOn(productoService, 'eliminar').and.resolveTo();
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
    await render();
    click(view.container.querySelector('.btn-outline-danger'));
    await flush();
    expect(confirmSpy).toHaveBeenCalledWith('¿Eliminar "PlayStation 5"?');
    expect(productoService.eliminar).not.toHaveBeenCalled();
  });

  it('si confirma, elimina el producto en el backend y recarga la lista', async () => {
    sesion('admin');
    spyOn(productoService, 'eliminar').and.resolveTo();
    spyOn(window, 'confirm').and.returnValue(true);
    await render();
    click(view.container.querySelector('.btn-outline-danger'));
    await flush();
    expect(productoService.eliminar).toHaveBeenCalledWith(1);
    expect(productoService.listar).toHaveBeenCalledTimes(2);
    expect(view.container.querySelector('.sg-toast').textContent).toBe('Producto eliminado');
  });

  it('si el backend rechaza la eliminación, muestra el mensaje', async () => {
    sesion('admin');
    spyOn(productoService, 'eliminar').and.rejectWith({ response: { status: 403, data: { message: 'No tienes permisos para esta acción' } } });
    spyOn(window, 'confirm').and.returnValue(true);
    await render();
    click(view.container.querySelector('.btn-outline-danger'));
    await flush();
    expect(view.container.querySelector('.sg-toast').textContent).toBe('No tienes permisos para esta acción');
  });
});
