import { act } from 'react';
import { ProductsProvider, useProducts } from './ProductsContext';
import { productoService } from '../services/productoService';
import { mount, flush, stubCatalogo, PRODUCTOS_BASE } from '../test/helpers';

describe('ProductsContext', () => {
  let api;
  let view;

  function Probe() {
    api = useProducts();
    return null;
  }

  const render = async () => {
    view = mount(<ProductsProvider><Probe /></ProductsProvider>);
    await flush();
  };

  afterEach(() => view.unmount());

  const nuevo = {
    name: 'Control DualSense',
    category: 'Controles',
    price: 69990,
    stock: 5,
    desc: 'Control inalámbrico',
    img: 'data:image/png;base64,AAAA'
  };

  it('carga los productos desde el catálogo (GET /products)', async () => {
    stubCatalogo(PRODUCTOS_BASE);
    await render();
    expect(productoService.listar).toHaveBeenCalledTimes(1);
    expect(api.products.length).toBe(PRODUCTOS_BASE.length);
    expect(api.loading).toBeFalse();
  });

  it('si el backend no responde, no hay productos y se informa el error', async () => {
    productoService.listar.and.rejectWith({ code: 'ERR_NETWORK', request: {} });
    await render();
    expect(api.products).toEqual([]);
    expect(api.error).toContain('No se pudo conectar');
  });

  it('addProduct envía el producto y vuelve a pedir el catálogo', async () => {
    stubCatalogo(PRODUCTOS_BASE);
    spyOn(productoService, 'crear').and.resolveTo({ ...nuevo, id: 4 });
    await render();
    let created;
    await act(async () => { created = await api.addProduct(nuevo); });
    await flush();
    expect(productoService.crear).toHaveBeenCalledWith(nuevo);
    expect(created.id).toBe(4);
    expect(productoService.listar).toHaveBeenCalledTimes(2);
  });

  it('addProduct propaga el error del backend (409 = nombre repetido)', async () => {
    stubCatalogo(PRODUCTOS_BASE);
    spyOn(productoService, 'crear').and.rejectWith({ response: { status: 409 } });
    await render();
    let error;
    await act(async () => {
      try { await api.addProduct(nuevo); } catch (e) { error = e; }
    });
    expect(error.response.status).toBe(409);
  });

  it('removeProduct elimina por id y vuelve a pedir el catálogo', async () => {
    stubCatalogo(PRODUCTOS_BASE);
    spyOn(productoService, 'eliminar').and.resolveTo();
    await render();
    await act(async () => { await api.removeProduct(1); });
    await flush();
    expect(productoService.eliminar).toHaveBeenCalledWith(1);
    expect(productoService.listar).toHaveBeenCalledTimes(2);
  });
});
