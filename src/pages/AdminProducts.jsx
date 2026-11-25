import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useToast } from '../context/ToastContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatCLP } from '../utils/format';
import { mensajeDeError } from '../services/api';

export default function AdminProducts() {
  usePageTitle('Productos (admin)');
  const { session } = useAuth();
  const { products, removeProduct } = useProducts();
  const { showToast } = useToast();
  const isAdmin = session?.rol === 'admin'; // el vendedor solo ve la lista

  const handleRemove = async product => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      await removeProduct(product.id);
      showToast('Producto eliminado');
    } catch (error) {
      showToast(mensajeDeError(error, 'No se pudo eliminar el producto'));
    }
  };

  return (
    <>
      <div className="admin-head">
        <h1>Productos</h1>
        {isAdmin && <Link to="/admin/producto-nuevo" className="btn btn-primary">+ Nuevo producto</Link>}
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
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
                  {isAdmin && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(p)}>Eliminar</button>
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
