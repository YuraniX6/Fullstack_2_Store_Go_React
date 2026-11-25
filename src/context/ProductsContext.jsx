import { createContext, useContext } from 'react';
import { useCarga } from '../hooks/useCarga';
import { productoService } from '../services/productoService';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  // Los productos vienen de CatalogService (GET /api/v1/products).
  const { datos, cargando, error, recargar } = useCarga(() => productoService.listar(), []);
  const products = datos || [];

  // Devuelve el producto creado; si el backend lo rechaza, lanza el error (409 = nombre repetido).
  const addProduct = async data => {
    const created = await productoService.crear(data);
    recargar();
    return created;
  };

  const removeProduct = async id => {
    await productoService.eliminar(id);
    recargar();
  };

  return (
    <ProductsContext.Provider value={{ products, loading: cargando, error, reload: recargar, addProduct, removeProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
