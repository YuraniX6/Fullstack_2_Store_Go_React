import AdminOrders from './AdminOrders';
import { ordenService } from '../services/ordenService';
import { AllProviders, mount, click, flush } from '../test/helpers';

const LISTA = [
  { id: 1, customerEmail: 'ana@duoc.cl', total: 1800000, createdAt: '2026-11-20T10:00:00', itemCount: 2, status: 'EMITIDA' },
  { id: 2, customerEmail: 'pedro@gmail.com', total: 250000, createdAt: '2026-11-21T12:00:00', itemCount: 1, status: 'CANCELADA' }
];
const DETALLE = {
  id: 1, customerEmail: 'ana@duoc.cl', total: 1800000, createdAt: '2026-11-20T10:00:00', status: 'EMITIDA',
  items: [{ productId: 1, productName: 'PlayStation 5', unitPrice: 900000, quantity: 2, subtotal: 1800000 }]
};
const sesion = rol => localStorage.setItem('storego_session', JSON.stringify({ email: 'x@duoc.cl', nombre: 'X', rol }));

describe('Página AdminOrders', () => {
  let view;
  const render = async () => {
    view = mount(<AllProviders><AdminOrders /></AllProviders>);
    await flush();
  };
  const filas = () => view.container.querySelectorAll('.table-responsive tbody tr');
  const boton = texto => [...view.container.querySelectorAll('button')].find(b => b.textContent.trim() === texto);

  beforeEach(() => {
    localStorage.clear();
    spyOn(ordenService, 'listar').and.resolveTo(LISTA);
  });
  afterEach(() => view.unmount());

  it('el vendedor ve la lista y el detalle, pero no puede cambiar estados ni eliminar', async () => {
    sesion('vendedor');
    await render();
    expect(filas().length).toBe(2);
    const textos = [...view.container.querySelectorAll('button')].map(b => b.textContent.trim());
    expect(textos.every(t => t === 'Ver' || t === 'Cerrar')).toBeTrue();
  });

  it('el administrador ve las acciones permitidas según el estado', async () => {
    sesion('admin');
    await render();
    expect(boton('Marcar enviada')).toBeDefined();
    expect(boton('Cancelar')).toBeDefined();
    expect(boton('Eliminar')).toBeDefined(); // solo la boleta CANCELADA
    expect(view.container.querySelectorAll('.btn-outline-danger').length).toBe(1);
  });

  it('el administrador cambia el estado con PATCH (mock del servicio)', async () => {
    sesion('admin');
    spyOn(ordenService, 'cambiarEstado').and.resolveTo({ ...LISTA[0], status: 'ENVIADA' });
    await render();
    click(boton('Marcar enviada'));
    await flush();
    expect(ordenService.cambiarEstado).toHaveBeenCalledWith(1, 'ENVIADA');
    expect(ordenService.listar).toHaveBeenCalledTimes(2);
  });

  it('"Ver" carga el detalle de la boleta con sus ítems', async () => {
    sesion('vendedor');
    spyOn(ordenService, 'obtener').and.resolveTo(DETALLE);
    await render();
    click(view.container.querySelector('.btn-outline-secondary'));
    await flush();
    expect(ordenService.obtener).toHaveBeenCalledWith(1);
    expect(view.container.textContent).toContain('PlayStation 5');
  });

  it('eliminar pide confirmación y llama al servicio solo si se acepta', async () => {
    sesion('admin');
    spyOn(ordenService, 'eliminar').and.resolveTo();
    spyOn(window, 'confirm').and.returnValue(true);
    await render();
    click(boton('Eliminar'));
    await flush();
    expect(ordenService.eliminar).toHaveBeenCalledWith(2);
  });
});
