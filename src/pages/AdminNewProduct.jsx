import ProductForm from '../components/ProductForm';
import { usePageTitle } from '../hooks/usePageTitle';

export default function AdminNewProduct() {
  usePageTitle('Nuevo producto');
  return (
    <>
      <h1>Nuevo producto</h1>
      <ProductForm />
    </>
  );
}
