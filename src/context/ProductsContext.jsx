import { createContext, useContext, useState } from 'react';
import { PRODUCTS } from '../data/products';

const ProductsContext = createContext(null);

const KEY = 'storego_products';

function loadCustom() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function ProductsProvider({ children }) {
  const [custom, setCustom] = useState(loadCustom);

  const persist = next => {
    setCustom(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      return true;
    } catch {
      return false; // almacenamiento lleno (por ejemplo, imagen muy pesada)
    }
  };

  // Devuelve el producto creado, o null si no se pudo guardar.
  const addProduct = data => {
    const product = { ...data, id: `p-${Date.now()}`, custom: true };
    return persist([...custom, product]) ? product : null;
  };

  const removeProduct = id => persist(custom.filter(p => p.id !== id));

  const products = [...PRODUCTS, ...custom];

  return (
    <ProductsContext.Provider value={{ products, addProduct, removeProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
