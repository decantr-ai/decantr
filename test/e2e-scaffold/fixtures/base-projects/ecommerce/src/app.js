import { mount } from 'decantr/core';
import { createRouter, link } from 'decantr/router';
import { createStore } from 'decantr/state';
import { setStyle, setMode } from 'decantr/css';
import { Button, Badge } from 'decantr/components';
import { tags } from 'decantr/tags';

import { HomePage } from './pages/home.js';
import { CatalogPage } from './pages/catalog.js';
import { ProductDetailPage } from './pages/product-detail.js';
import { CartPage } from './pages/cart.js';

const { div, nav, a, header, span } = tags;

setStyle('clean');
setMode('light');

// Cart store
export const [cart, setCart] = createStore({
  items: [],
  total: 0,
});

export function addToCart(product) {
  const existing = cart.items.find(item => item.id === product.id);
  if (existing) {
    setCart('items', item => item.id === product.id, 'quantity', q => q + 1);
  } else {
    setCart('items', items => [...items, { ...product, quantity: 1 }]);
  }
  updateTotal();
}

function updateTotal() {
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  setCart('total', total);
}

const router = createRouter({
  routes: [
    { path: '/', component: HomePage },
    { path: '/catalog', component: CatalogPage },
    { path: '/products/:id', component: ProductDetailPage },
    { path: '/cart', component: CartPage },
  ],
  fallback: () => div({ class: '_p8 _textcenter' }, 'Page not found'),
});

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/catalog', label: 'Shop' },
];

function App() {
  const [route] = router.useRoute();
  const cartCount = () => cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return div({ class: '_minh[100vh] _flex _col _bgbg' },
    header({ class: '_bgsurface _bcborder _bb _sticky _top0 _z50' },
      div({ class: '_maxw[1200px] _mx[auto] _px6 _py4 _flex _justifybetween _itemscenter' },
        a({ ...link('/'), class: '_fslg _fwbold _fgtext' }, 'Store'),
        nav({ class: '_flex _gap6 _itemscenter' },
          navItems.map(item =>
            a({
              ...link(item.path),
              class: () => route().path === item.path ? '_fgprimary _fwmedium' : '_fgmuted _hover:fgtext',
            }, item.label)
          ),
          a({ ...link('/cart'), class: '_relative' },
            Button({ variant: 'outline', size: 'sm' }, 'Cart'),
            () => cartCount() > 0 ? Badge({ class: '_absolute _top[-8px] _right[-8px]' }, cartCount()) : null
          )
        ),
      )
    ),
    div({ class: '_flex1 d-page-enter' },
      router.outlet
    )
  );
}

mount(document.getElementById('app'), App);
