import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid row g-4">
          <div className="footer-brand col-12 col-lg-6">
            <div className="logo"><span>Store</span>Go</div>
            <p>Tu tienda de consolas y videojuegos de confianza.</p>
          </div>
          <div className="footer-col col-6 col-lg-3">
            <h4>Tienda</h4>
            <Link to="/productos">Productos</Link>
            <Link to="/carrito">Carrito</Link>
          </div>
          <div className="footer-col col-6 col-lg-3">
            <h4>Soporte</h4>
            <Link to="/contacto">Contacto</Link>
            <a href="#">Preguntas frecuentes</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 StoreGo. Derechos reservados a HakyoCorps y Archiweb</div>
      </div>
    </footer>
  );
}
