import { tags } from 'decantr/tags';
import { useRoute } from 'decantr/router';
import { Card, Button, Badge } from 'decantr/components';
import { addToCart } from '../app.js';

const { div, h1, p, span } = tags;

const productsData = {
  '1': { id: 1, name: 'Premium Headphones', price: 199, category: 'Electronics', inStock: true, description: 'High-quality wireless headphones with active noise cancellation and premium sound.' },
  '2': { id: 2, name: 'Leather Wallet', price: 79, category: 'Accessories', inStock: true, description: 'Handcrafted genuine leather wallet with multiple card slots and RFID protection.' },
  '3': { id: 3, name: 'Smart Watch', price: 299, category: 'Electronics', inStock: false, description: 'Advanced smartwatch with health tracking, GPS, and 7-day battery life.' },
  '4': { id: 4, name: 'Canvas Backpack', price: 89, category: 'Bags', inStock: true, description: 'Durable canvas backpack with laptop compartment and water-resistant coating.' },
};

export function ProductDetailPage() {
  const route = useRoute();
  const productId = () => route().params.id;
  const product = () => productsData[productId()] || { name: 'Product Not Found', description: 'This product could not be found.' };

  const handleAddToCart = () => {
    if (product().inStock) {
      addToCart(product());
    }
  };

  return div({ class: '_py12 _px6 _maxw[1000px] _mx[auto]' },
    div({ class: '_grid _gc2 _md:gc1 _gap8' },
      // Product image
      div({ class: '_h[400px] _bgsurface _rounded _flex _itemscenter _justifycenter _fgmuted' },
        'Product Image'
      ),

      // Product info
      div({ class: '_flex _col _gap4' },
        div({ class: '_fssm _fgmuted' }, () => product().category),
        h1({ class: '_fs2xl _fwbold' }, () => product().name),

        div({ class: '_flex _itemscenter _gap2' },
          span({ class: '_fs2xl _fwbold _fgprimary' }, () => `$${product().price}`),
          () => product().inStock
            ? Badge({ variant: 'success' }, 'In Stock')
            : Badge({ variant: 'error' }, 'Out of Stock'),
        ),

        p({ class: '_fgmuted _lh[1.6]' }, () => product().description),

        div({ class: '_flex _gap4 _mt4' },
          Button({
            variant: 'primary',
            size: 'lg',
            disabled: () => !product().inStock,
            onClick: handleAddToCart,
          }, 'Add to Cart'),
        ),
      )
    )
  );
}
