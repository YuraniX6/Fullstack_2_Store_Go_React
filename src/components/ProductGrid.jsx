import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  return (
    <div className="row g-4">
      {products.map(p => (
        <div className="col-12 col-sm-6 col-lg-4" key={p.id}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
