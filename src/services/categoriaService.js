import { catalogApi } from './api';

// Categorías (CatalogService, puerto 8083)
export const categoriaService = {
  listar: () => catalogApi.get('/categories').then(r => r.data),
  obtener: id => catalogApi.get(`/categories/${id}`).then(r => r.data),
  crear: categoria => catalogApi.post('/categories', categoria).then(r => r.data),
  actualizar: (id, categoria) => catalogApi.put(`/categories/${id}`, categoria).then(r => r.data),
  eliminar: id => catalogApi.delete(`/categories/${id}`)
};
