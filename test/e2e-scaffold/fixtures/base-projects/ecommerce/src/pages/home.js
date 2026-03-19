import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { Card, Button } from 'decantr/components';

const { div, h1, h2, p, section, a } = tags;

const featuredProducts = [
  { id: 1, name: 'Premium Headphones', price: 199, category: 'Electronics' },
  { id: 2, name: 'Leather Wallet', price: 79, category: 'Accessories' },
  { id: 3, name: 'Smart Watch', price: 299, category: 'Electronics' },
  { id: 4, name: 'Canvas Backpack', price: 89, category: 'Bags' },
];

export function HomePage() {
  return div({},
    // Hero
    section({ class: '_py20 _px6 _textcenter _bgsurface' },
      div({ class: '_maxw[700px] _mx[auto]' },
        h1({ class: '_fs4xl _fwbold _mb4' }, 'Quality Products'),
        p({ class: '_fslg _fgmuted _mb8' },
          'Discover our curated collection of premium products.'
        ),
        a({ ...link('/catalog') },
          Button({ variant: 'primary', size: 'lg' }, 'Shop Now')
        ),
      ),
    ),

    // Featured products
    section({ class: '_py16 _px6 _maxw[1200px] _mx[auto]' },
      h2({ class: '_fs2xl _fwbold _mb8' }, 'Featured Products'),
      div({ class: '_grid _gc4 _md:gc2 _sm:gc1 _gap6' },
        featuredProducts.map(product =>
          a({ ...link(`/products/${product.id}`) },
            Card({
              class: '_hover:shadow _trans[box-shadow_0.2s]',
              children: [
                div({ class: '_h[200px] _bgsurface _flex _itemscenter _justifycenter _fgmuted _roundedt' },
                  'Image'
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
      ),
    )
  );
}
