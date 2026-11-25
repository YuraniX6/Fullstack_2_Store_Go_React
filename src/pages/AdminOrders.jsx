import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCarga } from '../hooks/useCarga';
import { usePageTitle } from '../hooks/usePageTitle';
import { ordenService } from '../services/ordenService';
import { mensajeDeError } from '../services/api';
import { formatCLP } from '../utils/format';

// Transiciones permitidas (mismas reglas que OrderService)
const SIGUIENTES = {
  EMITIDA: ['ENVIADA', 'CANCELADA'],
  ENVIADA: ['ENTREGADA', 'CANCELADA'],
  ENTREGADA: [],
  CANCELADA: []
};
const ETIQUETA = { EMITIDA: 'Emitida', ENVIADA: 'Enviada', ENTREGADA: 'Entregada', CANCELADA: 'Cancelada' };
const CLASE = { EMITIDA: 'text-bg-warning', ENVIADA: 'text-bg-info', ENTREGADA: 'text-bg-success', CANCELADA: 'text-bg-secondary' };
const ACCION = { ENVIADA: 'Marcar enviada', ENTREGADA: 'Marcar entregada', CANCELADA: 'Cancelar' };

const formatFecha = iso => (iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '—');

export default function AdminOrders() {
  usePageTitle('Órdenes');
  const { session } = useAuth();
  const { showToast } = useToast();
  const isAdmin = session?.rol === 'admin'; // el vendedor solo consulta
  const { datos, cargando, error, recargar } = useCarga(() => ordenService.listar(), []);
  const ordenes = datos || [];
  const [detalle, setDetalle] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const verDetalle = async id => {
    try {
      setDetalle(await ordenService.obtener(id));
    } catch (e) {
      showToast(mensajeDeError(e, 'No se pudo cargar la boleta'));
    }
  };

  const cambiarEstado = async (orden, status) => {
    setOcupado(true);
    try {
      const actualizada = await ordenService.cambiarEstado(orden.id, status);
      showToast(`Boleta #${orden.id}: ${ETIQUETA[status]}`);
      if (detalle?.id === orden.id) setDetalle(actualizada);
      recargar();
    } catch (e) {
      showToast(mensajeDeError(e, 'No se pudo cambiar el estado'));
    } finally {
      setOcupado(false);
    }
  };

  const eliminar = async orden => {
    if (!window.confirm(`¿Eliminar la boleta #${orden.id}?`)) return;
    try {
      await ordenService.eliminar(orden.id);
      if (detalle?.id === orden.id) setDetalle(null);
      showToast('Boleta eliminada');
      recargar();
    } catch (e) {
      showToast(mensajeDeError(e, 'No se pudo eliminar la boleta'));
    }
  };

  return (
    <>
      <h1>Órdenes</h1>
      {error && <p className="text-danger">{error}</p>}
      {cargando ? (
        <p>Cargando órdenes…</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>N°</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Ítems</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customerEmail}</td>
                  <td>{formatFecha(o.createdAt)}</td>
                  <td>{o.itemCount}</td>
                  <td>{formatCLP(o.total)}</td>
                  <td><span className={`badge ${CLASE[o.status]}`}>{ETIQUETA[o.status]}</span></td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => verDetalle(o.id)}>Ver</button>
                    {isAdmin && (SIGUIENTES[o.status] || []).map(s => (
                      <button key={s} className="btn btn-sm btn-outline-primary me-1" disabled={ocupado}
                        onClick={() => cambiarEstado(o, s)}>{ACCION[s]}</button>
                    ))}
                    {isAdmin && o.status === 'CANCELADA' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(o)}>Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
              {!ordenes.length && (
                <tr><td colSpan={7}>No hay boletas todavía</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <div className="card mt-4 p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h5 mb-0">Boleta #{detalle.id} · {detalle.customerEmail}</h2>
            <button className="btn btn-sm btn-link" onClick={() => setDetalle(null)}>Cerrar</button>
          </div>
          <table className="table table-sm mt-3">
            <thead>
              <tr><th>Producto</th><th>Precio</th><th>Cant.</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {detalle.items.map(it => (
                <tr key={it.productId}>
                  <td>{it.productName}</td>
                  <td>{formatCLP(it.unitPrice)}</td>
                  <td>{it.quantity}</td>
                  <td>{formatCLP(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-end mb-0"><strong>Total: {formatCLP(detalle.total)}</strong></p>
        </div>
      )}
    </>
  );
}
