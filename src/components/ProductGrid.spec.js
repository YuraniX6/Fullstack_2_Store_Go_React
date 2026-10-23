import ProductGrid from './ProductGrid';
import { PRODUCTS } from '../data/products';
import { AllProviders, mount } from '../test/helpers';

describe('ProductGrid (grilla Bootstrap)', () => {
  let view;
  beforeEach(() => localStorage.clear());
  afterEach(() => view.unmount());

  it('dibuja una columna responsiva por producto dentro de un row', () => {
    view = mount(<AllProviders><ProductGrid products={PRODUCTS} /></AllProviders>);
    expect(view.container.querySelectorAll('.row').length).toBe(1);
    const cols = view.container.querySelectorAll('.col-12.col-sm-6.col-lg-4');
    expect(cols.length).toBe(PRODUCTS.length);
    expect(view.container.querySelectorAll('.product-card').length).toBe(PRODUCTS.length);
  });

  it('sin productos no dibuja columnas', () => {
    view = mount(<AllProviders><ProductGrid products={[]} /></AllProviders>);
    expect(view.container.querySelectorAll('.col-lg-4').length).toBe(0);
  });
});
