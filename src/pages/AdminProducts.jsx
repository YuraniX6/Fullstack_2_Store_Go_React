import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useToast } from '../context/ToastContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatCLP } from '../utils/format';

export default function AdminProducts() {
  usePageTitle('Productos (admin)');
  const { products, removeProduct } = useProducts();
  const { showToast } = useToast();

  const handleRemove = product => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    removeProduct(product.id);
    showToast('Producto eliminado');
  };

  return (
    <>
      <div className="admin-head">
        <h1>Productos</h1>
        <Link to="/admin/producto-nuevo" className="btn btn-primary">+ Nuevo producto</Link>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><img src={p.img} alt={p.name} className="table-thumb" /></td>
                <td>
                  <strong>{p.name}</strong>
                  <div className="table-desc">{p.desc}</div>
                </td>
                <td>{p.category}</td>
                <td>{formatCLP(p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  {p.custom ? (
                    <button className="remove-item" onClick={() => handleRemove(p)}>Eliminar</button>
                  ) : (
                    <span className="table-desc">Base</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
