import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { link } from 'decantr/router';
import { Card, Input, Select, Button } from 'decantr/components';

const { div, h1, a } = tags;

const products = [
  { id: 1, name: 'Premium Headphones', price: 199, category: 'Electronics', inStock: true },
  { id: 2, name: 'Leather Wallet', price: 79, category: 'Accessories', inStock: true },
  { id: 3, name: 'Smart Watch', price: 299, category: 'Electronics', inStock: false },
  { id: 4, name: 'Canvas Backpack', price: 89, category: 'Bags', inStock: true },
  { id: 5, name: 'Wireless Earbuds', price: 149, category: 'Electronics', inStock: true },
  { id: 6, name: 'Sunglasses', price: 129, category: 'Accessories', inStock: true },
  { id: 7, name: 'Laptop Sleeve', price: 49, category: 'Bags', inStock: true },
  { id: 8, name: 'Phone Case', price: 29, category: 'Accessories', inStock: false },
];

export function CatalogPage() {
  const [search, setSearch] = createSignal('');
  const [category, setCategory] = createSignal('all');
  const [inStockOnly, setInStockOnly] = createSignal(false);

  const filteredProducts = () => {
    let result = products;
    if (search()) {
      result = result.filter(p => p.name.toLowerCase().includes(search().toLowerCase()));
    }
    if (category() !== 'all') {
      result = result.filter(p => p.category === category());
    }
    if (inStockOnly()) {
      result = result.filter(p => p.inStock);
    }
    return result;
  };

  return div({ class: '_py12 _px6 _maxw[1200px] _mx[auto]' },
    h1({ class: '_fs3xl _fwbold _mb8' }, 'Shop'),

    // Filter bar
    Card({
      class: '_p4 _mb8',
      children: div({ class: '_flex _gap4 _itemscenter _flexwrap' },
        Input({
          placeholder: 'Search products...',
          value: search,
          onInput: (e) => setSearch(e.target.value),
          class: '_flex1 _minw[200px]',
        }),
        Select({
          value: category,
          onChange: setCategory,
          options: [
            { value: 'all', label: 'All Categories' },
            { value: 'Electronics', label: 'Electronics' },
            { value: 'Accessories', label: 'Accessories' },
            { value: 'Bags', label: 'Bags' },
          ],
        }),
        Button({
          variant: inStockOnly() ? 'primary' : 'outline',
          onClick: () => setInStockOnly(!inStockOnly()),
        }, 'In Stock Only'),
      ),
    }),

    // Products grid
    div({ class: '_grid _gc4 _md:gc2 _sm:gc1 _gap6' },
      () => filteredProducts().map(product =>
        a({ ...link(`/products/${product.id}`) },
          Card({
            class: '_hover:shadow _trans[box-shadow_0.2s]',
            children: [
              div({ class: '_h[180px] _bgsurface _flex _itemscenter _justifycenter _fgmuted _roundedt _relative' },
                'Image',
                !product.inStock ? div({ class: '_absolute _top2 _right2 _px2 _py1 _bgerror _fgwhite _fssm _rounded' }, 'Out of Stock') : null
              ),
              Card.Body({},
                div({ class: '_fssm _fgmuted _mb1' }, product.category),
                div({ class: '_fwbold _mb2' }, product.name),
                div({ class: '_fgprimary _fwbold' }, `$${product.price}`),
              ),
            ],
          })
        )
      )
    )
  );
}
