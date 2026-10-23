import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { session, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = e => {
    e.preventDefault();
    close();
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="scan-line"></div>
      <div className="container header-inner">
        <Link to="/" className="logo"><span>Store</span>Go</Link>

        {/* Navbar de Bootstrap: se despliega en pantallas chicas y queda en línea desde md */}
        <nav className="navbar navbar-expand-md">
          <div className={`collapse navbar-collapse${open ? ' show' : ''}`} id="mainNav">
            <ul className="navbar-nav">
              <li className="nav-item"><NavLink to="/" end className="nav-link" onClick={close}>Inicio</NavLink></li>
              <li className="nav-item"><NavLink to="/productos" className="nav-link" onClick={close}>Productos</NavLink></li>
              <li className="nav-item"><NavLink to="/contacto" className="nav-link" onClick={close}>Contacto</NavLink></li>
              {!session && (
                <>
                  <li className="nav-item"><NavLink to="/login" className="nav-link" onClick={close}>Iniciar sesión</NavLink></li>
                  <li className="nav-item"><NavLink to="/registro" className="nav-link" onClick={close}>Registrarse</NavLink></li>
                </>
              )}
              {session && session.rol !== 'cliente' && (
                <li className="nav-item"><NavLink to="/admin" className="nav-link" onClick={close}>Panel</NavLink></li>
              )}
              {session && (
                <li className="nav-item">
                  <a href="#" className="nav-link" onClick={handleLogout}>Salir ({session.nombre})</a>
                </li>
              )}
            </ul>
          </div>
        </nav>

        <div className="header-actions">
          <Link to="/carrito" className="icon-btn" aria-label="Carrito">
            <img
              src={count > 0 ? '/img/carrito_ocupado.png' : '/img/carrito_vacio.png'}
              alt="Carrito"
              className="cart-icon-img"
            />
            <span className="cart-count">{count}</span>
          </Link>
          <button
            className="icon-btn d-md-none"
            id="menuToggle"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
