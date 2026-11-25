import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useToast } from '../context/ToastContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatCLP } from '../utils/format';
import { ordenService } from '../services/ordenService';
import { mensajeDeError } from '../services/api';

export default function Cart() {
  usePageTitle('Carrito');
  const { items, total, changeQty, removeFromCart, clearCart } = useCart();
  const { showToast } = useToast();
  const { session } = useAuth();
  const { reload } = useProducts();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) {
      showToast('Tu carrito está vacío');
      return;
    }
    if (!session) {
      showToast('Inicia sesión para finalizar tu compra');
      navigate('/login');
      return;
    }
    try {
      await ordenService.comprar(items.map(i => ({ productId: i.id, quantity: i.qty })));
    } catch (error) {
      showToast(mensajeDeError(error, 'No se pudo completar la compra'));
      return;
    }
    clearCart();
    reload(); // el stock cambió: se vuelve a pedir el catálogo
    showToast('¡Compra realizada con éxito!');
  };

  return (
    <section className="products">
      <div className="container">
        <span className="eyebrow">STOREGO MARKET</span>
        <h2 className="section-title">Tu carrito</h2>
        <div className="carrito-layout row g-4">
          <div className="items-carrito col-lg-8">
            {items.length === 0 ? (
              <p className="carrito-vacio">Tu carrito está vacío.</p>
            ) : (
              items.map(({ id, qty, product }) => (
                <div className="carrito-item" key={id}>
                  <img src={product.img} alt={product.name} />
                  <div className="carrito-item-info">
                    <h3>{product.name}</h3>
                    <p>{formatCLP(product.price)} c/u</p>
                  </div>
                  <div className="qty-controls">
                    <button aria-label="Quitar uno" onClick={() => changeQty(id, -1)}>−</button>
                    <span>{qty}</span>
                    <button aria-label="Agregar uno" onClick={() => changeQty(id, 1)}>+</button>
                  </div>
                  <strong>{formatCLP(product.price * qty)}</strong>
                  <button className="remove-item" onClick={() => removeFromCart(id)}>Quitar</button>
                </div>
              ))
            )}
          </div>
          <div className="col-lg-4">
          <aside className="resumen">
            <h2>Resumen</h2>
            <div className="resumen-linea">
              <span>Productos</span>
              <span>{formatCLP(total)}</span>
            </div>
            <div className="resumen-linea">
              <span>Envío</span>
              <span>GRATIS</span>
            </div>
            <hr />
            <div className="resumen-linea total">
              <span>Total</span>
              <strong>{formatCLP(total)}</strong>
            </div>
            <button className="btn btn-primary" id="finalizarCompra" onClick={handleCheckout}>
              Finalizar compra
            </button>
          </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
