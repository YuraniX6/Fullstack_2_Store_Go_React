import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { useCarga } from '../hooks/useCarga';
import { usePageTitle } from '../hooks/usePageTitle';
import { usuarioService } from '../services/usuarioService';

export default function AdminDashboard() {
  usePageTitle('Panel');
  const { session } = useAuth();
  const { products } = useProducts();
  const isAdmin = session.rol === 'admin';
  // Solo el administrador puede consultar los usuarios (GET /api/v1/auth/users).
  const { datos: users } = useCarga(() => (isAdmin ? usuarioService.listar() : Promise.resolve(null)), [isAdmin]);

  return (
    <>
      <h1>¡HOLA {session.nombre}!</h1>
      <span className="role-badge">{session.rol}</span>
      <div className="stat-grid row g-3">
        <div className="col-sm-6"><div className="stat-card"><strong>{products.length}</strong><span>Productos en la tienda</span></div></div>
        {isAdmin && (
          <div className="col-sm-6"><div className="stat-card"><strong>{users ? users.length : '…'}</strong><span>Usuarios registrados</span></div></div>
        )}
      </div>
    </>
  );
}
