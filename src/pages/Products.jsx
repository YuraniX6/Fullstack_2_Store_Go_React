import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../context/ProductsContext';
import { CATEGORIAS } from '../data/categorias';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Products() {
  usePageTitle('Productos');
  const { products } = useProducts();
  const [params, setParams] = useSearchParams();
  const active = params.get('cat') || '';
  const visible = active ? products.filter(p => p.category === active) : products;

  const select = cat => (cat ? setParams({ cat }) : setParams({}));

  return (
    <section className="products">
      <div className="container">
        <h2 className="section-title">Todos los productos</h2>
        <div className="filter-bar">
          <button className={`chip${active === '' ? ' active' : ''}`} onClick={() => select('')}>Todos</button>
          {CATEGORIAS.map(c => (
            <button key={c} className={`chip${active === c ? ' active' : ''}`} onClick={() => select(c)}>{c}</button>
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="carrito-vacio">No hay productos en esta categoría todavía.</p>
        ) : (
          <ProductGrid products={visible} />
        )}
      </div>
    </section>
  );
}
