import { ordersApi } from './api';

// Compras y boletas (OrderService, puerto 8084)
export const ordenService = {
  /** Envía SOLO { productId, quantity }: el precio lo calcula el backend con el catálogo. */
  comprar: items => ordersApi.post('/orders', { items }).then(r => r.data),
  mias: () => ordersApi.get('/orders/mine').then(r => r.data),
  listar: () => ordersApi.get('/orders').then(r => r.data),
  obtener: id => ordersApi.get(`/orders/${id}`).then(r => r.data),
  /** estado: EMITIDA, ENVIADA, ENTREGADA o CANCELADA (solo ADMIN) */
  cambiarEstado: (id, status) => ordersApi.patch(`/orders/${id}/status`, { status }).then(r => r.data),
  eliminar: id => ordersApi.delete(`/orders/${id}`)
};
