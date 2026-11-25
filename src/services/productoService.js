import { catalogApi } from './api';

// Catálogo (CatalogService, puerto 8083)
export const productoService = {
  /** params opcionales: { category } */
  listar: params => catalogApi.get('/products', { params }).then(r => r.data),
  obtener: id => catalogApi.get(`/products/${id}`).then(r => r.data),
  crear: producto => catalogApi.post('/products', producto).then(r => r.data),
  actualizar: (id, producto) => catalogApi.put(`/products/${id}`, producto).then(r => r.data),
  eliminar: id => catalogApi.delete(`/products/${id}`)
};
